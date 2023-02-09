import axios from 'axios';
import { describe, it, expect, vi } from 'vitest';
import App, { storiesReducer } from './App';
import { SearchForm } from './SearchForm';
import { Item } from './List'

import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';


vi.mock('axios')

const storyOne = {
  title: 'React',
  url: 'https://reactjs.org/',
  author: 'Jordan Walke',
  num_comments: 3,
  points: 4,
  objectID: 0,
};
const storyTwo = {
  title: 'Redux',
  url: 'https://redux.js.org/',
  author: 'Dan Abramov, Andrew Clark',
  num_comments: 2,
  points: 5,
  objectID: 1,
};

const storyThree = {
  title: 'Jest',
  url: 'https://jest.org/',
  author: 'Reallyidk',
  num_comments: 2,
  points: 5,
  objectID: 2,
};

const stories = [storyOne, storyTwo, storyThree];

describe('storiesReducer', () => {
  it('removes a story from all stories', () => {
    const action = { type: 'REMOVE_STORY', payload: storyOne };
    const state = { data: stories, isLoading: false, isError: false }
    
    const newState = storiesReducer(state, action);

    const expectedState = {
      data: [storyTwo, storyThree],
      isLoading: false,
      isError: false,
    };

    expect(newState).toStrictEqual(expectedState);
  });

  it('adds stories', () => {
    const action = { type: 'STORIES_FETCH_SUCCESS', payload: stories};
    const state = { data: {}, isLoading: false, isError: false }
    
    const newState = storiesReducer(state, action);

    const expectedState = {
      data: stories,
      isLoading: false,
      isError: false,
    };

    expect(newState).toStrictEqual(expectedState);
  })
});

describe('Item', () => {
  it('renders all properties', () => {
    render(<Item item={storyOne} />)

    expect(screen.getByText('Jordan Walke')).toBeInTheDocument();
    expect(screen.getByText('React')).toHaveAttribute(
      'href',
      'https://reactjs.org/'
    )
  })

  it('renders a clickable dismiss button', () => {
    render(<Item item={storyOne} />)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('clicking the dismiss button calls the callback handler', () => {
    const handleRemoveItem = vi.fn()

    render(<Item item={storyOne} onRemoveItem={handleRemoveItem} />)

    fireEvent.click(screen.getByRole('button'))

    expect(handleRemoveItem).toHaveBeenCalledTimes(1)
  })

})

describe('SearchForm', () => {
  const searchFormProps = {
    searchTerm: 'React',
    onSearchInput: vi.fn(),
    onSearchSubmit: vi.fn(),
    searchFormClassName: 'button_small'
  }

  it('renders the input field with its value', () => {
    render(<SearchForm {...searchFormProps} />)

    expect(screen.getByDisplayValue('React')).toBeInTheDocument()
    
    expect(screen.getByLabelText(/Search/)).toBeInTheDocument()
    
  })

  it('calls onSearchInput on input field change', () => {
    render(<SearchForm {...searchFormProps} />)

    fireEvent.change(screen.getByDisplayValue('React'), {
      target: {value: 'Redux'},
    })

    expect(searchFormProps.onSearchInput).toHaveBeenCalledOnce();
  })

  it('calls onSearchSubmit on button submit click', () => {
    render(<SearchForm {...searchFormProps} />)

    fireEvent.submit(screen.getByRole('button'))

    expect(searchFormProps.onSearchSubmit).toHaveBeenCalledOnce()
  })
})

describe('App', () => {
  it('succeeds fetching data', async () => {
    const api_call = Promise.resolve({
      data: {
        hits: stories,
      },
    })

    axios.get.mockImplementationOnce(() => api_call);

    render(<App />)

    expect(screen.getByText(/Loading/)).toBeInTheDocument()

    await waitFor(async () => await api_call)

    expect(screen.queryByText(/Loading/)).toBeNull()
    
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Redux')).toBeInTheDocument()
    expect(screen.getByText('Jest')).toBeInTheDocument()
    expect(screen.getAllByText('Dismiss').length).toBe(3)
  })

  it('fails fetching data', async () => {
    const api_call = Promise.reject()

    axios.get.mockImplementationOnce(() => api_call)

    render(<App />)

    expect(screen.getByText(/Loading/)).toBeInTheDocument()
    try {
      await waitFor(async () => await api_call)
    } catch (error) {
      expect(screen.queryByText(/Loading/)).toBeNull()
      expect(screen.getByText(/went wrong/)).toBeInTheDocument()
    }
  })

  it('removes a story', async () => {
    const api_call = Promise.resolve({
      data: {
        hits: stories,
      },
    })

    axios.get.mockImplementationOnce(() => api_call)

    render(<App />)

    await waitFor(async () => await api_call)

    expect(screen.getAllByText('Dismiss').length).toBe(3)
    expect(screen.getByText('Jordan Walke')).toBeInTheDocument()

    fireEvent.click(screen.getAllByText('Dismiss')[0])

    expect(screen.getAllByText('Dismiss').length).toBe(2)
    expect(screen.queryByText('Jordan Walke')).toBeNull()

  })

  it('searches for specific stories', async () => {
    const reactPromise = Promise.resolve({
      data: {
        hits: stories,
      },
    });

    const anotherStory = {
      title: 'JavaScript',
      url: 'https://en.wikipedia.org/wiki/JavaScript',
      author: 'Brendan Eich',
      num_comments: 15,
      points: 10,
      objectID: 3,
    };

    const javascriptPromise = Promise.resolve({
      data: {
        hits: [anotherStory],
      },
    });

    axios.get.mockImplementation((url) => {
      if (url.includes('React')) {
        return reactPromise;
      }

      if (url.includes('JavaScript')) {
        return javascriptPromise;
      }

      throw Error();
    });

    // Initial Render

    render(<App />);

    // First Data Fetching

    await waitFor(async () => await reactPromise);

    expect(screen.getByDisplayValue('React')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('JavaScript')).toBeNull();

    expect(screen.getByText('Jordan Walke')).toBeInTheDocument();
    expect(
      screen.getByText('Dan Abramov, Andrew Clark')
    ).toBeInTheDocument();
    expect(screen.queryByText('Brendan Eich')).toBeNull();

    // User Interaction -> Search

    fireEvent.change(screen.queryByDisplayValue('React'), {
      target: {
        value: 'JavaScript',
      },
    });

    expect(screen.queryByDisplayValue('React')).toBeNull();
    expect(
      screen.getByDisplayValue('JavaScript')
    ).toBeInTheDocument();

    fireEvent.submit(screen.queryByText('Submit'));

    // Second Data Fetching

    await waitFor(async () => await javascriptPromise);

    expect(screen.queryByText('Jordan Walke')).toBeNull();
    expect(
      screen.queryByText('Dan Abramov, Andrew Clark')
    ).toBeNull();
    expect(screen.getByText('Brendan Eich')).toBeInTheDocument();
  })
})