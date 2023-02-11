import * as React from 'react';
import axios from 'axios';

import './App.css';

import { SearchForm } from './SearchForm'
import { List } from './List'


type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
};

type Stories = Story[];

type StoriesState = {
  data: Stories;
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


const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';


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
        data: action.payload,
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

const getUrl = (searchTerm: string) => `${API_ENDPOINT}${searchTerm}`

const extractSearchTerm = (url: string) => url.replace(API_ENDPOINT, '')

const getLastSearches = (urls: string[]) => 
  urls
    .reduce((result: string[], url, index) => {
      const searchTerm = extractSearchTerm(url)

      if (index === 0) {
        return result.concat(searchTerm)
      }

      const previousSearchTerm = result[result.length - 1]

      if (searchTerm === previousSearchTerm) {
        return result
      } else {
        return result.concat(searchTerm)
      }
    }, [])
    .slice(-6)
    .slice(0, -1)
    .map((url) => extractSearchTerm(url))

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

  const [urls, setUrls] = React.useState([getUrl(searchTerm)]);

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const lastUrl = urls[urls.length - 1]
      const result = await axios.get(lastUrl);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits,
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

  const handleSearch = (searchTerm: string) => {
    const url = getUrl(searchTerm)
    setUrls(urls.concat(url))
  }

  const handleSearchSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    handleSearch(searchTerm)

    event.preventDefault();
  }

  const handleLastSearch = (searchTerm: string) => {
    handleSearch(searchTerm)
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

      {lastSearches.map((searchTerm, index) => (
        <button 
          key={searchTerm + index}
          type="button"
          onClick={() => handleLastSearch(searchTerm)}
        >
          {searchTerm}
        </button>
      ))}

      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List
          list={stories.data}
          onRemoveItem={handleRemoveStory}
        />
      )}
    </div>
  );
};


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