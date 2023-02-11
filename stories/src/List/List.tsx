import React from 'react'
import { sortBy } from 'lodash'

const upArrow = require('./up.svg').default
const downArrow = require('./down.svg').default

type sortsMap = {
  NONE: (List: Stories) => Stories; 
  TITLE: (List: Stories) => Stories;
  AUTHOR: (List: Stories) => Stories;
  COMMENT: (List: Stories) => Stories;
  POINT: (List: Stories) => Stories;
}
type SortKey = 'NONE' | 'TITLE' | 'AUTHOR' | 'COMMENT' | 'POINT'

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
};

type ItemProps = {
  item: Story;
  onRemoveItem: (item: Story) => void;
};

const SORTS: sortsMap= {
  NONE: (list: Stories) => list,
  TITLE: (list: Stories) => sortBy(list, 'title'),
  AUTHOR: (list: Stories) => sortBy(list, 'author'),
  COMMENT: (list: Stories) => sortBy(list, 'num_comments').reverse(),
  POINT: (list: Stories) => sortBy(list, 'points').reverse(),
}

const List: React.FC<ListProps> = React.memo(
  ({ list, onRemoveItem }) => {

    const [sort, setSort] = React.useState({
      sortKey: 'NONE',
      isReverse: false,
    })

    const handleSort = (sortKey: SortKey) => {
      const isReverse = sort.sortKey === sortKey && !sort.isReverse
      
      setSort({ sortKey, isReverse })
    }

    const sortFunction = SORTS[sort.sortKey as keyof sortsMap]
    const sortedList = sort.isReverse
      ? sortFunction(list).reverse()
      : sortFunction(list)

    return (
    <ul>
      <li style={{ display: 'flex' }}>
        <span style={{ width: '40%' }}>
          <button className='list_button' type="button" onClick={() => handleSort('TITLE')}>
            {sort.sortKey === 'TITLE' 
              ? (sort.isReverse 
                ? <img style={{ width: '10px' }} src={upArrow} alt='up' />
                : <img style={{ width: '10px' }} src={downArrow} alt='down' />)
              : null
            }
            Title
          </button>
        </span>
        <span style={{ width: '30%' }}>
          <button className='list_button' type="button" onClick={() => handleSort('AUTHOR')}>
          {sort.sortKey === 'AUTHOR' 
              ? (sort.isReverse 
                ? <img style={{ width: '10px' }} src={upArrow} alt='up' />
                : <img style={{ width: '10px' }} src={downArrow} alt='down' />)
              : null
            }
            Author
          </button>
        </span>
        <span style={{ width: '10%' }}>
          <button className='list_button' type="button" onClick={() => handleSort('COMMENT')}>
          {sort.sortKey === 'COMMENT' 
              ? (sort.isReverse 
                ? <img style={{ width: '10px' }} src={upArrow} alt='up' />
                : <img style={{ width: '10px' }} src={downArrow} alt='down' />)
              : null
            }
            Comments
          </button>
        </span>
        <span style={{ width: '10%' }}>
          <button className='list_button' type="button" onClick={() => handleSort('POINT')}>
          {sort.sortKey === 'POINT' 
              ? (sort.isReverse 
                ? <img style={{ width: '10px' }} src={upArrow} alt='up' />
                : <img style={{ width: '10px' }} src={downArrow} alt='down' />)
              : null
            }
            Points
          </button>
        </span>
        <span style={{ width: '10%' }}>Actions</span>
      </li>
      {sortedList.map((item: Story) => (
        <Item
          key={item.objectID}
          item={item}
          onRemoveItem={onRemoveItem}
        />
      ))}
    </ul>
  )
});

const Item: React.FC<ItemProps> = ({ item, onRemoveItem }) => (
  <li className='item' style={{ display: 'flex'}}>
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

export { List, Item }