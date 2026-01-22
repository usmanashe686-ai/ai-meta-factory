import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';

const suggestion = {
  items: ({ query }: { query: string }) => {
    const onlineUsers = [
      { id: 'user1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
      { id: 'user2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
      { id: 'user3', name: 'Bob Johnson', avatar: 'https://i.pravatar.cc/150?img=3' },
    ];
    
    return onlineUsers
      .filter((user) =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.id.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);
  },

  render: () => {
    let component: ReactRenderer;
    let popup: any;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props: any) {
        component.updateProps(props);

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }

        return component.ref?.onKeyDown(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};

export default suggestion;

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

const MentionList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item.id, label: item.name });
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="bg-white border rounded-lg shadow-lg overflow-hidden min-w-[200px]">
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${
              index === selectedIndex ? 'bg-blue-50 text-blue-600' : ''
            }`}
            key={item.id}
            onClick={() => selectItem(index)}
          >
            <div className="flex items-center gap-2">
              <img
                src={item.avatar}
                alt={item.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="font-medium">{item.name}</span>
            </div>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-gray-500">No users found</div>
      )}
    </div>
  );
});

MentionList.displayName = 'MentionList';
