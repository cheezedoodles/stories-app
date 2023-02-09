import React from 'react';
import { InputWithLabel } from '../InputWithLabel'

type SearchFormProps = {
  searchTerm: string;
  onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  searchFormClassName: string;
};

const SearchForm: React.FC<SearchFormProps> = ({
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

export { SearchForm }