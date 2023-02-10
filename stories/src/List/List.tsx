import React from 'react'

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

const List: React.FC<ListProps> = React.memo(
  ({ list, onRemoveItem }) => {
    const [sort, setSort] = React.useState('NONE')

    const handleSort = (sortKey) => {
      setSort(sortKey)
    }

    return (
    <ul>
      <li style={{ display: 'flex' }}>
        <span style={{ width: '40%' }}>
          <button type="button" onClick={() => handleSort('TITLE')}>
            Title
          </button>
        </span>
        <span style={{ width: '30%' }}>
          <button type="button" onClick={() => handleSort('AUTHOR')}>
            Author
          </button>
        </span>
        <span style={{ width: '10%' }}>
          <button type="button" onClick={() => handleSort('COMMENT')}>
            Comments
          </button>
        </span>
        <span style={{ width: '10%' }}>
          <button type="button" onClick={() => handleSort('POINT')}>
            Points
          </button>
        </span>
        <span style={{ width: '10%' }}>Actions</span>
      </li>
      {list.map((item) => (
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