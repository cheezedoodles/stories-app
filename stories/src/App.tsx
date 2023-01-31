import * as React from 'react';
import axios from 'axios';

import './App.css';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';


type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
};

type Stories = Story[];

type ListProps = {
  list: Stories;
  onRemoveItem: (item: Story) => void; 
}

type ItemProps = {
  item: Story;
  onRemoveItem: (item: Story) => void;
}

const storiesReducer = (state, action) => {
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

const getSumComments = (stories) => {
  return stories.data.reduce(
    (result, value) => result + value.num_comments,
    0
  );
};

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

  const [url, setUrl] = React.useState(
    `${API_ENDPOINT}${searchTerm}`
  );

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const result = await axios.get(url);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits,
      });
    } catch {
      dispatchStories({type: 'STORIES_FETCH_FAILURE'})
    }
  }, [url])

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = React.useCallback((item: Story) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  }, []);

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);

    event.preventDefault();
  }

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

const InputWithLabel = ({
  id,
  value,
  type = 'text',
  onInputChange,
  isFocused,
  children,
}) => {
  const inputRef = React.useRef();

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <label htmlFor={id} className='label'>
        {children}
      </label>
      &nbsp;
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
        className='input'
      />
    </>
  );
};

const List: React.FC<ListProps> = React.memo(
    ({ list, onRemoveItem }) => (
      <ul>
        {list.map((item) => (
          <Item
            key={item.objectID}
            item={item}
            onRemoveItem={onRemoveItem}
          />
        ))}
      </ul>
    )
);

const Item: React.FC<ItemProps> = ({ item, onRemoveItem }) => (
  <li className='item'>
    <span style={{ width: '40%' }}>
      <a href={item.url}>{item.title} </a>
    </span>
    <span style={{ width: '30%' }}>{item.author} </span>
    <span style={{ width: '10%' }}>{item.num_comments} </span>
    <span style={{ width: '10%' }}>{item.points} </span>
    <span style={{ width: '10%' }}>
      <button 
        type="button" 
        onClick={() => onRemoveItem(item)}
        className='button button_small'
      >
        Dismiss
      </button>
    </span>
  </li>
);

const SearchForm = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit,
  searchFormClassName
}) => (
  <form onSubmit={onSearchSubmit} className='search-form'>
  <InputWithLabel
    id="search"
    value={searchTerm}
    isFocused
    onInputChange={onSearchInput}
  >
    <strong>Search:</strong>
  </InputWithLabel>
  &nbsp;
  <button 
    type="submit" 
    disabled={!searchTerm} 
    className={`button ${searchFormClassName}`}
  >
    Submit
  </button>
</form>
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