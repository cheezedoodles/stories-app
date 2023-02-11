import * as React from 'react';
import axios from 'axios';

import './App.css';

import { SearchForm } from './SearchForm'
import { List } from './List'


type LastSearchesProps = {
  lastSearches: string[];
  onLastSearch: (url: string) => void;
}

type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
};

type Stories = {
  list: Story[];
  page: number
}

type StoriesState = {
  data: Stories['list'];
  page: Stories['page'];
  isLoading: boolean;
  isError: boolean;
};

type StoriesFetchInitAction = {
  type: 'STORIES_FETCH_INIT';
};

type StoriesFetchSuccessAction = {
  type: 'STORIES_FETCH_SUCCESS';
  payload: Stories;
};

type StoriesFetchFailureAction = {
  type: 'STORIES_FETCH_FAILURE';
};

type StoriesRemoveAction = {
  type: 'REMOVE_STORY';
  payload: Story;
};

type StoriesAction = 
  StoriesFetchInitAction
  | StoriesFetchSuccessAction
  | StoriesFetchFailureAction
  | StoriesRemoveAction;

  const API_BASE = 'https://hn.algolia.com/api/v1';
  const API_SEARCH = '/search';
  const PARAM_SEARCH = 'query=';
  const PARAM_PAGE = 'page=';

const storiesReducer = (
  state: StoriesState, 
  action: StoriesAction
) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: 
          action.payload.page === 0
            ? action.payload.list
            : state.data.concat(action.payload.list),
        page: action.payload.page,
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID),
      };
    default:
      throw new Error();
  }
};

const getSumComments = (stories: StoriesState ) => {
  return stories.data.reduce(
    (result, value) => result + value.num_comments,
    0
  );
};

const getUrl = (searchTerm: string, page: number) => 
  `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`

const extractSearchTerm = (url: string) =>
  url
    .substring(url.lastIndexOf('?') + 1, url.lastIndexOf('&'))
    .replace(PARAM_SEARCH, '');

const getLastSearches = (urls: string[]) =>
  urls
    .reduce((result: string[], url, index) => {
      const searchTerm = extractSearchTerm(url);

      if (index === 0) {
        return result.concat(searchTerm);
      }

      const previousSearchTerm = result[result.length - 1];

      if (searchTerm === previousSearchTerm) {
        return result;
      } else {
        return result.concat(searchTerm);
      }
    }, [])
    .slice(-6)
    .slice(0, -1);

const useStorageState = (
  key: string, 
  initialState: string
): [string, (newValue: string) => void] => {
  const isMounted = React.useRef(false)

  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      localStorage.setItem(key, value);
    }
  }, [value, key]);
  

  return [value, setValue];
};

const App = () => {
  const [searchTerm, setSearchTerm] = useStorageState(
    'search',
    'React'
  );

  const [urls, setUrls] = React.useState([getUrl(searchTerm, 0)]);

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], page: 0, isLoading: false, isError: false }
  );

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const lastUrl = urls[urls.length - 1]
      const result = await axios.get(lastUrl);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: {
          list: result.data.hits,
          page: result.data.page,
        },
      });
    } catch {
      dispatchStories({type: 'STORIES_FETCH_FAILURE'})
    }
  }, [urls])

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = React.useCallback((item: Story) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  }, []);

  const handleSearchInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = (searchTerm: string, page: number) => {
    const url = getUrl(searchTerm, page)
    setUrls(urls.concat(url))
  }

  const handleSearchSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    handleSearch(searchTerm, 0)

    event.preventDefault();
  }

  const handleLastSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm)
    
    handleSearch(searchTerm, 0)
  }

  const fetchMoreData = () => {
    const lastUrl = urls[urls.length - 1]
    const searchTerm = extractSearchTerm(lastUrl)
    handleSearch(searchTerm, stories.page + 1);
  }

  const lastSearches = getLastSearches(urls)

  const sumComments = React.useMemo(
    () => getSumComments(stories),
    [stories]
  );
  
  return (
    <div className='container'>
      <h1 className='headline-primary'>
        My Hacker Stories with {sumComments} comments.
      </h1>
      <SearchForm 
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
        searchFormClassName='button_small'
      />

      <LastSearches
        lastSearches={lastSearches}
        onLastSearch={handleLastSearch}
      />

      {stories.isError && <p>Something went wrong ...</p>}

      <List
          list={stories.data}
          onRemoveItem={handleRemoveStory}
        />

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <button type="button" onClick={fetchMoreData}>
          More
        </button>
      )}
    </div>
  );
};


const LastSearches: React.FC<LastSearchesProps> = 
  ({ lastSearches, onLastSearch }) => (
    <div>{lastSearches.map((searchTerm, index) => (
      <button 
        key={searchTerm + index}
        type="button"
        onClick={() => onLastSearch(searchTerm)}
      >
        {searchTerm}
      </button>
    ))}
    </div>
)


// Class Component
// class InputClass extends React.Component {
//   constructor(props) {
//     super(props)
//     this.state = {searchingFor: ''}
//     this.onChange = this.onChange.bind(this)
//   }

//   onChange(event) {
//     this.setState({searchingFor: event.target.value})
//   }
//   render() {
//     const { searchingFor } = this.state
//     return(
//       <div>
//         <p>{searchingFor}</p>
//         <input 
//           type='text'
//           onChange={this.onChange}/>
//       </div>
//   )}
// }

export default App;

export { storiesReducer }
