import { AssigneeSelectProps } from '../AssigneeSelect'
import { DropdownRef } from '../Dropdown'
import { forwardRef } from 'react'
import * as Styled from './WatcherSelect.styled'
import clsx from 'clsx'

export interface WatcherSelectProps extends Omit<AssigneeSelectProps, 'emptyMessage'> {
  currentUser: string
  isWatching?: boolean
}

export const WatcherSelect = forwardRef<DropdownRef, WatcherSelectProps>(
  ({ currentUser, isWatching, ...props }, ref) => {
    // is the current user a watcher
    const currentUserWatcher = (currentUser && props.value.includes(currentUser)) || isWatching

    const handleWatch = (selected: string[]) => {
      // check if the current user is not a watcher
      if (!currentUserWatcher && currentUser) {
        // add the current user to the watchers
        const newWatchers = [...selected, currentUser]
        // call the onChange function with the new watchers
        props.onChange && props.onChange(newWatchers)
      }
    }

    const handleUnwatch = (selected: string[]) => {
      // check if the current user is a watcher
      if (currentUserWatcher) {
        // remove the current user from the watchers
        const newWatchers = selected.filter((watcher) => watcher !== currentUser)
        // call the onChange function with the new watchers
        props.onChange && props.onChange(newWatchers)
      }
    }

    return (
      <Styled.AssigneeSelect
        ref={ref}
        valueTemplate={(value, selected, isOpen) => (
          <Styled.WatcherButton
            variant="text"
            selected={isOpen}
            icon={currentUserWatcher ? 'notifications_active' : 'notifications'}
            className={clsx({ watching: currentUserWatcher })}
          />
        )}
        selectAllKey={null}
        startContent={(value, selected) => (
          <Styled.StartContent>
            <Styled.WatchStateButton
              variant="text"
              icon="notifications_active"
              selected={currentUserWatcher}
              onClick={() => handleWatch(selected as string[])}
              data-tooltip="Notify me to changes."
            >
              Watch
            </Styled.WatchStateButton>
            <Styled.WatchStateButton
              variant="text"
              icon="notifications_off"
              selected={!currentUserWatcher}
              onClick={() => handleUnwatch(selected as string[])}
              data-import="Notify me only on @mentions or assignment."
            >
              Unwatch
            </Styled.WatchStateButton>
          </Styled.StartContent>
        )}
        {...props}
      />
    )
  },
)
