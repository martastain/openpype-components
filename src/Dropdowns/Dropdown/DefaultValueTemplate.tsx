import { FC } from 'react'
import styled, { css } from 'styled-components'
import { Icon, IconType } from '../../Icon'
import { DropdownProps } from './Dropdown'

const DefaultValueStyled = styled.div`
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--border-radius-m);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 8px;
  gap: 8px;
  cursor: pointer;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  & > * {
    position: relative;
  }

  .icon.control {
    transition: transform 0.15s;
    /* scale and opacity goes to 0 when open  */
    ${({ $isOpen }: { $isOpen: boolean }) =>
      $isOpen &&
      css`
        &:not(#clear):not(#backspace) {
          transform: rotate(180deg);
        }
      `}
  }
`

const ValueStyled = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`

const ContentStyled = styled.div`
  overflow: hidden;
  gap: 8px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
`

export interface DefaultValueTemplateProps
  extends Pick<
    DropdownProps,
    | 'value'
    | 'isMultiple'
    | 'dropIcon'
    | 'onClear'
    | 'onClearNullValue'
    | 'nullPlaceholder'
    | 'placeholder'
  > {
  displayIcon?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  valueStyle?: React.CSSProperties
  isOpen?: boolean
  className?: string
  childrenCustom?: React.ReactNode
}

export const DefaultValueTemplate: FC<DefaultValueTemplateProps> = ({
  value = [],
  isMultiple,
  dropIcon = 'expand_more',
  displayIcon,
  onClear,
  onClearNullValue,
  nullPlaceholder,
  children,
  style,
  valueStyle,
  placeholder = 'Select an option...',
  isOpen,
  className,
  childrenCustom,
}) => {
  const noValue = !value?.length

  const handleOnClearClick = (value: null | []) => {
    onClear && onClear(value)
  }

  return (
    <DefaultValueStyled style={style} $isOpen={!!isOpen} className={className}>
      {noValue ? (
        <>
          <ContentStyled>
            <ValueStyled style={{ opacity: 0.5 }}>
              {value === null
                ? nullPlaceholder || '(no value)'
                : onClearNullValue
                ? '(empty list)'
                : placeholder}
            </ValueStyled>
          </ContentStyled>
          {onClear && onClearNullValue && (
            <>
              <Icon
                icon={'backspace'}
                onClick={() => handleOnClearClick(null)}
                id={'backspace'}
                className="control"
                tabIndex={0}
                data-tooltip={'Set to Inherit (null)'}
              />
              <Icon
                icon={'close'}
                onClick={() => handleOnClearClick([])}
                id={'clear'}
                className="control"
                tabIndex={0}
                data-tooltip={'Clear to empty list'}
              />
            </>
          )}
        </>
      ) : (
        <>
          <ContentStyled>
            {isMultiple && <span>{`Mixed (`}</span>}
            {displayIcon && <Icon icon={displayIcon as IconType} />}
            <ValueStyled style={valueStyle}>{children}</ValueStyled>
            {isMultiple && <span>{`)`}</span>}
          </ContentStyled>
          {onClear && onClearNullValue && (
            <Icon
              icon={'backspace'}
              onClick={() => handleOnClearClick(null)}
              id={'backspace'}
              className="control"
              tabIndex={0}
              data-tooltip={'Clear to NULL'}
            />
          )}
          {onClear && (
            <Icon
              icon={'close'}
              onClick={() => handleOnClearClick([])}
              id="clear"
              className="control"
              tabIndex={0}
              data-tooltip={'Clear to empty list'}
            />
          )}
        </>
      )}
      {childrenCustom}
      <Icon icon={dropIcon} className="control" />
    </DefaultValueStyled>
  )
}
