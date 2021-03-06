import Emoji from 'components/Emoji';
import Input from 'components/Input';
import React from 'react';
import Sortable from 'components/Sortable';
import Stack from 'components/Stack';
import { focusOnTodoWithIndex } from 'utils/focusOn';
import keyCodes from 'utils/keyCodes';
import styles from './styles.module.css';
import useDispatch from 'hooks/useDispatch';
import useSelector from 'hooks/useSelector';
import Button from 'components/Button';

import { getTodos } from 'modules/selectors';

import {
  moveTodo,
  newTodo,
  pasteTasks,
  removeTodo,
  toggleTodo,
  updateTodoIdent,
  updateTodoText,
} from 'modules/task';

export default function TaskTodos() {
  const todos = useSelector(getTodos);
  const dispatch = useDispatch();

  return (
    <Stack.Column>
      <Sortable.List
        useDragHandle={true}
        onSort={({ oldIndex, newIndex }: any) =>
          dispatch(
            moveTodo({
              id: todos[oldIndex]!.id,
              by: newIndex - oldIndex,
            }),
          )
        }>
        {todos.map((todo, i) => (
          <Sortable.Item
            index={i}
            align="start"
            as={Stack.Row}
            key={todo.id}
            style={{ paddingLeft: 20 * (todo.ident || 0) }}
            onClick={(e: any) => {
              if (e.metaKey) {
                e.preventDefault();
                e.stopPropagation();
                dispatch(toggleTodo(todo));
              }
            }}>
            <Sortable.Handle className={styles.handle} />
            <div className={styles.box}>
              {todo.isCompleted ? (
                <Emoji
                  emoji={'✅'}
                  onClick={e => {
                    e.stopPropagation();
                    dispatch(toggleTodo(todo));
                  }}
                />
              ) : (
                <div
                  className={styles.checkbox}
                  onClick={e => {
                    e.stopPropagation();
                    dispatch(toggleTodo(todo));
                  }}
                />
              )}
            </div>
            <Input
              id={`todo-text-${i}`}
              value={todo.text}
              className={todo.isCompleted ? styles.completed : undefined}
              disableCmd={true}
              onChange={text => {
                if (!text || text !== todo.text) {
                  dispatch(
                    updateTodoText({
                      id: todo.id,
                      text,
                    }),
                  );
                }
              }}
              onPaste={clipboard => {
                dispatch(pasteTasks({ id: todo.id, clipboard }));
              }}
              onKeyDown={e => {
                if (
                  e.keyCode === keyCodes.backspace &&
                  (e.target.value === '' || e.metaKey)
                ) {
                  e.preventDefault();
                  dispatch(removeTodo(todo));
                  focusOnTodoWithIndex(i - 1);
                } else if (e.keyCode === keyCodes.enter) {
                  dispatch(newTodo({ after: todo }));
                } else if (e.keyCode === keyCodes.esc) {
                  e.target.blur();
                } else if (!e.metaKey && e.keyCode === keyCodes.up) {
                  focusOnTodoWithIndex(i - 1);
                } else if (!e.metaKey && e.keyCode === keyCodes.down) {
                  focusOnTodoWithIndex(i + 1);
                } else if (e.metaKey && e.keyCode === keyCodes.up) {
                  dispatch(moveTodo({ id: todo.id, by: -1 }));
                } else if (e.metaKey && e.keyCode === keyCodes.down) {
                  dispatch(moveTodo({ id: todo.id, by: +1 }));
                } else if (e.metaKey && e.keyCode === keyCodes['[']) {
                  dispatch(updateTodoIdent({ id: todo.id, by: -1 }));
                } else if (e.metaKey && e.keyCode === keyCodes[']']) {
                  dispatch(updateTodoIdent({ id: todo.id, by: 1 }));
                } else if (
                  e.metaKey &&
                  e.shiftKey &&
                  e.keyCode === keyCodes.c
                ) {
                  dispatch(toggleTodo(todo));
                }
              }}
            />
          </Sortable.Item>
        ))}
      </Sortable.List>
      <div className={styles.actions}>
        <Button onClick={() => dispatch(newTodo())}>New Todo</Button>
      </div>
    </Stack.Column>
  );
}
