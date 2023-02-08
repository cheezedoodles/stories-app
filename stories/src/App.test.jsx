import { describe, it, expect, vi } from 'vitest';

import App, {
  storiesReducer,
  Item,
  List,
  SearchForm,
  InputWithLabel,
} from './App';

import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';

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
  })
})