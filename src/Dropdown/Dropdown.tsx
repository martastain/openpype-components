import { CSSProperties, forwardRef, useEffect } from 'react'
import { useState } from 'react'
import { useRef } from 'react'
import styled, { css, keyframes } from 'styled-components'
import { compact, isEqual, isNull } from 'lodash'
import { useMemo } from 'react'
import { InputText } from '../Inputs/InputText'
import { Icon, IconType } from '../Icon'
import DefaultValueTemplate from './DefaultValueTemplate'
import TagsValueTemplate from './TagsValueTemplate'

// background acts as a blocker
const BackdropStyled = styled.div`
  position: fixed;
  inset: 0;
  background-color: unset;
  z-index: 11;
`

const dropdownMenuAnimation = keyframes`
  0% {
    transform: scale(.95);
    opacity: .6;
}
100% {
    transform: scale(1);
    opacity: 1;
}
`

const ButtonStyled = styled.button<{
  isChanged: boolean
}>`
  /* remove defaults */
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  &:not(:focus) {
    outline: inherit;
  }

  &:hover {
    background-color: var(--color-grey-02);
  }

  border-radius: var(--border-radius);

  ${({ isChanged }) =>
    isChanged &&
    css`
      background-color: var(--color-row-hl);
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      background-color: var(--input-disabled-background-color) !important;
      color: var(--color-text-dim);
      font-style: italic;
    `}
`

const DropdownStyled = styled.div`
  position: relative;
  height: 30px;
  /* width: 100%; */
  display: inline-block;

  button {
    width: 100%;
  }

  & > * {
    height: 100%;
  }
`

const ContainerStyled = styled.form<{
  isOpen: boolean
  height?: number
  startAnimation: boolean
  message: string
}>`
  width: 100%;
  position: relative;
  height: ${({ height }) => `${height}px`};
  width: auto;
  display: inline-block;
  height: min-content;

  position: fixed;
  z-index: 60;

  transform-origin: top;

  ${({ startAnimation }) =>
    startAnimation
      ? css`
          animation: ${dropdownMenuAnimation} 0.03s ease-in forwards;
        `
      : css`
          opacity: 0;
        `}

  /* position: fixed; */

  /* show warning when changing multiple entities */
  ${({ isOpen, message }) =>
    isOpen &&
    message &&
    css`
      &::before {
        content: '${message}';
        top: 0;
        translate: 0 -100%;
        position: absolute;
        background-color: var(--color-grey-00);
        border-radius: var(--border-radius) var(--border-radius) 0 0;
        z-index: 10;
        display: flex;
        align-items: center;
        padding: 4px 0;
        right: 0;
        left: 0;
        outline: 1px solid #383838;
        justify-content: center;
      }
    `}
`

const OptionsStyled = styled.ul<{
  message: string
  search: boolean
}>`
  width: auto;
  list-style-type: none;
  padding: unset;

  display: flex;
  flex-direction: column;

  margin: 0px;
  /* same border used as primereact dropdowns */
  outline: 1px solid var(--color-grey-03);
  background-color: var(--color-grey-00);
  z-index: 20;
  border-radius: ${({ message, search }) =>
    message || search ? '0 0 var(--border-radius) var(--border-radius)' : 'var(--border-radius)'};
  overflow: clip;

  position: relative;

  transition: max-height 0.15s;

  /* scrolling */
  max-height: 300px;
  overflow-y: scroll;

  ::-webkit-scrollbar {
    display: none;
  }
`

const ListItemStyled = styled.li<{
  focused: boolean
  usingKeyboard: boolean
}>`
  cursor: pointer;

  ${({ usingKeyboard }) =>
    !usingKeyboard &&
    css`
      &:hover {
        background-color: var(--color-grey-02);
      }
    `}

  /* focused */
  outline-offset: -1px;
  ${({ focused }) =>
    focused &&
    css`
      background-color: var(--color-grey-02);

      & > * {
        outline: solid #93cbf9 1px;
        outline-offset: -1px;
      }
    `}
`

const DefaultItemStyled = styled.span<{
  isSelected: boolean
}>`
  display: flex;
  gap: 8px;
  align-items: center;
  height: 30px;
  padding: 0 8px;

  ${({ isSelected }) =>
    isSelected &&
    css`
      background-color: var(--color-row-hl);
    `}
`

const SearchStyled = styled.div`
  /* put to top of list */
  order: -2;
  position: relative;
  height: 29px;
  width: 100%;

  /* search icon */
  span {
    position: absolute;
    left: 8px;
    top: 50%;
    translate: 0 -50%;
    z-index: 10;
  }

  /* input */
  input {
    width: calc(100% + 2px);
    position: relative;
    left: -1px;
    height: 100%;
    text-indent: 35px;

    border-radius: var(--border-radius) var(--border-radius) 0 0;

    &:focus {
      outline: unset;
    }
  }
`

// types
export interface DropdownProps {
  message?: string
  itemStyle?: CSSProperties
  valueStyle?: CSSProperties
  listStyle?: CSSProperties
  onOpen?: () => void
  onClose?: () => void
  value: Array<string | number>
  valueTemplate?: ((value?: (string | number)[]) => React.ReactNode) | 'tags'
  dataKey?: string
  dataLabel?: string
  options: Array<any>
  itemTemplate?: (option: any, isActive: boolean, isSelected: boolean) => React.ReactNode
  align?: 'left' | 'right'
  multiSelect?: boolean
  search?: boolean
  disabled?: boolean
  valueIcon?: string
  emptyMessage?: string
  placeholder?: string
  isChanged?: boolean
  isMultiple?: boolean
  onChange?: (v: (string | number)[]) => void
  maxOptionsShown?: number
  style?: CSSProperties
  className?: string
  widthExpand?: boolean
  searchFields?: string[]
  minSelected?: number
  dropIcon?: IconType
  onClear?: () => void
  editable?: boolean
}

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      value = [],
      valueTemplate,
      valueStyle,
      listStyle,
      dataKey = 'value',
      dataLabel = 'label',
      options = [],
      itemTemplate,
      itemStyle,
      searchFields = ['value'],
      valueIcon,
      message,
      disabled,
      onClose,
      onChange,
      onOpen,
      widthExpand,
      align = 'left',
      multiSelect,
      isMultiple,
      search,
      placeholder = 'Select an option...',
      emptyMessage,
      isChanged,
      maxOptionsShown = 25,
      style,
      className,
      minSelected = 0,
      dropIcon = 'expand_more',
      onClear,
      editable,
    },
    ref,
  ) => {
    value = useMemo(() => compact(value), [value])

    // if there are multiple but multiSelect is false
    if (!multiSelect && value.length > 1) {
      isMultiple = true
    }

    const [isOpen, setIsOpen] = useState(false)
    // Style states
    const [pos, setPos] = useState<{
      x: number | null
      y: number | null
    }>({ x: null, y: null })
    const [startAnimation, setStartAnimation] = useState(false)
    const [minWidth, setMinWidth] = useState(0)
    // search
    const [searchForm, setSearchForm] = useState('')
    // selection
    const [selected, setSelected] = useState<(string | number)[]>([])
    // keyboard states
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const [usingKeyboard, setUsingKeyboard] = useState(false)

    // REFS
    const valueRef = useRef<HTMLButtonElement>(null)
    const optionsRef = useRef<HTMLUListElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    // USE EFFECTS
    // sets the correct position and height
    useEffect(() => {
      if (isOpen && valueRef.current && optionsRef.current) {
        const valueRec = valueRef.current.getBoundingClientRect()
        const valueWidth = valueRec.width

        const optionsRec = optionsRef.current.getBoundingClientRect()
        const optionsWidth = optionsRec.width
        const optionsHeight = optionsRec.height

        let x = valueRec.x
        let y = valueRec.y

        if (align === 'right') {
          x = x + valueWidth - optionsWidth
        }

        // check it's not vertically off screen
        if (optionsHeight + y + 20 > window.innerHeight) {
          y = window.innerHeight - optionsHeight - 20
        }

        // first set position
        setPos({ x, y })
        if (widthExpand) setMinWidth(valueWidth)

        // then start animation
        setStartAnimation(true)
      } else {
        setStartAnimation(false)
      }
    }, [isOpen, valueRef, optionsRef, setMinWidth, setStartAnimation, setPos])

    // set initial selected from value
    useEffect(() => {
      setSelected(value)
    }, [value, setSelected])

    // keyboard support
    useEffect(() => {
      // focus element
      if (usingKeyboard) {
        const childNode = optionsRef.current?.childNodes[activeIndex || 0] as HTMLLIElement
        // scroll
        const parentHeight = optionsRef.current?.getBoundingClientRect().height || 0

        const childNodeRect = childNode?.getBoundingClientRect()
        const parentRect = optionsRef.current?.getBoundingClientRect()

        const childTop = childNodeRect?.top - (parentRect?.top || 0)
        const childBottom = childNodeRect?.bottom - (parentRect?.top || 0)

        if (childBottom > parentHeight) {
          // scroll down
          optionsRef.current?.scrollTo(
            0,
            optionsRef.current?.scrollTop + (childBottom - parentHeight),
          )
        } else if (childTop < 0) {
          // scroll up
          optionsRef.current?.scrollTo(0, optionsRef.current?.scrollTop + childTop)
        }
      }
    }, [activeIndex, options, usingKeyboard, optionsRef])

    // if editable, merge current search into showOptions
    options = useMemo(() => {
      // add in any values that are not in options
      const selectedNotInOptions = value.filter((s) => !options.some((o) => o[dataKey] === s))
      const selectedNotInOptionsItems = selectedNotInOptions.map((s) => ({
        [dataKey]: s,
        [dataLabel]: s,
      }))

      return [...selectedNotInOptionsItems, ...options]
    }, [value, options])

    if ((search || editable) && searchForm) {
      // filter out search matches
      options = options.filter((o) =>
        searchFields.some(
          (key) => o[key] && String(o[key])?.toLowerCase()?.includes(searchForm.toLowerCase()),
        ),
      )
    }

    // reorder options to put active at the top
    options = useMemo(
      () => [...options].sort((a, b) => value.indexOf(b[dataKey]) - value.indexOf(a[dataKey])),
      [value, options],
    )

    // if editable, merge current search into showOptions
    options = useMemo(() => {
      if (editable) {
        const searchItem = {
          [dataKey]: searchForm,
          [dataLabel]: searchForm ? `Add new "${searchForm}"` : 'Type to add new items...',
          icon: 'add',
        }

        return [searchItem, ...options]
      } else return options
    }, [editable, searchForm, options])

    // HANDLERS

    const handleClose = (
      e?: React.MouseEvent<HTMLDivElement>,
      changeValue?: (string | number)[],
    ): void => {
      // changeValue is used on single select
      changeValue = changeValue || selected

      e?.stopPropagation()

      // close dropdown
      setIsOpen(false)

      // reset keyboard
      setActiveIndex(null)

      // callback
      onClose && onClose()

      // reset search
      setSearchForm('')

      // check for difs
      if (isEqual(changeValue, value)) return
      // commit changes
      onChange && onChange(changeValue)
      //   reset selected
      setSelected([])

      // focus on value
      valueRef.current?.focus()
    }

    const handleChange = (
      value: string | number,
      index: number,
      e?: React.MouseEvent<HTMLLIElement>,
    ): void => {
      e?.stopPropagation()

      let newSelected = [...selected]

      const addingNew = editable && index === 0

      if (!multiSelect) {
        // replace current value with new one
        newSelected = [value]
      } else {
        if (!addingNew || searchForm) {
          // add/remove from selected
          if (newSelected.includes(value)) {
            if (newSelected.length > minSelected) {
              // remove
              newSelected.splice(newSelected.indexOf(value), 1)
            }
          } else {
            // add
            newSelected.push(value)
          }
        }
      }
      // update state
      setSelected(newSelected)
      // if not multi, close
      if (!multiSelect || (addingNew && searchForm)) handleClose(undefined, newSelected)
    }

    const handleOpen = (e: React.MouseEvent<HTMLButtonElement>): void => {
      // check if onClear was clicked
      if ((e.target as HTMLDivElement).id === 'clear') return

      if (disabled) return
      e.stopPropagation()
      setIsOpen(true)

      onOpen && onOpen()
    }

    const handleSearchSubmit = (e: React.MouseEvent<HTMLFormElement>): void => {}

    // KEY BOARD CONTROL
    const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
      // NAVIGATE DOWN
      if (e.code === 'ArrowDown') {
        let length = options.length
        if (activeIndex === null || activeIndex >= length - 1) {
          // got to top
          setActiveIndex(0)
        } else {
          // go down one
          setActiveIndex((isNull(activeIndex) ? -1 : activeIndex) + 1)
        }
      }

      // NAVIGATE UP
      if (e.code === 'ArrowUp' && activeIndex !== null) {
        if (activeIndex === 0) {
          // go to bottom
          setActiveIndex(options.length - 1)
        } else {
          // go one up
          setActiveIndex(activeIndex - 1)
        }
      }

      let selectedValue

      if (activeIndex !== null && options[activeIndex] && options[activeIndex][dataKey]) {
        selectedValue = options[activeIndex][dataKey]
      }

      if (e.code === 'ArrowDown' || e.code === 'ArrowUp') {
        e.preventDefault()
        if (isOpen) {
          if (!usingKeyboard) setUsingKeyboard(true)
        } else if (!multiSelect && selectedValue) {
          // flick through options without opening
          onChange && onChange([selectedValue])
        }
      }

      // SUBMIT WITH ENTER
      if (e.code === 'Enter') {
        // prevent reloads
        e.preventDefault()

        // open
        if (!isOpen) {
          // check not clear button
          if ((e.target as HTMLDivElement).id === 'clear') return onChange && onChange([])
          return setIsOpen(true)
        }

        if (multiSelect) {
          handleChange(selectedValue, activeIndex || 0)

          // nothing selected and only one option
          if (options.length === 1 || (options.length === 2 && editable)) {
            handleClose(undefined, [...selected, options[0][dataKey]])
          }
        } else {
          // only one option and no keyboard
          if (options.length === 1 && !editable) {
            selectedValue = options[0][dataKey]
          }

          if (editable && searchForm) {
            selectedValue = searchForm
          }

          handleClose(undefined, [selectedValue])
          // focus back on button
          valueRef.current?.focus()
        }
      }

      // CLOSE WITH ESC or TAB
      if (e.code === 'Escape' || (e.code === 'Tab' && isOpen)) {
        if (e.code === 'Escape') {
          // focus back on button
          valueRef.current?.focus()
        }
        handleClose()
      }
    }

    const labels = useMemo(() => {
      let result: any[] = []
      options.forEach((o) => {
        if (value.includes(o[dataKey])) {
          result.push(o[dataLabel] || o[dataKey])
        }
      })
      return result
    }, [options, value, dataKey, dataLabel])

    const displayIcon = useMemo(() => {
      if (!value.length || valueTemplate === 'tags') return null
      if (valueIcon) return valueIcon
      if (multiSelect && value.length > 1) return null
      if (options.length) return options[editable ? 1 : 0].icon
      return null
    }, [valueIcon, multiSelect, options])

    // splice to maxOptionsShown or 25 items
    let showOptions = useMemo(
      () => (search || editable ? [...options].splice(0, maxOptionsShown) : options),
      [options, maxOptionsShown],
    )

    let hiddenLength = useMemo(() => options.length - showOptions.length, [options, showOptions])

    const DefaultValueTemplateProps = {
      value,
      isMultiple,
      dropIcon,
      displayIcon,
      onClear: value.length > minSelected ? onClear : undefined,
      style: valueStyle,
      placeholder,
    }

    // filter out valueTemplate
    const valueTemplateNode = useMemo(() => {
      if (typeof valueTemplate === 'function') return valueTemplate
      if (valueTemplate === 'tags')
        return () => <TagsValueTemplate {...DefaultValueTemplateProps} />
    }, [valueTemplate, value])

    return (
      <DropdownStyled
        onKeyDown={handleKeyPress}
        onMouseMove={() => usingKeyboard && setUsingKeyboard(false)}
        style={style}
        className={className}
        ref={ref}
      >
        {value && (
          <ButtonStyled
            ref={valueRef}
            onClick={handleOpen}
            disabled={disabled}
            isChanged={!!isChanged}
          >
            {valueTemplateNode ? (
              valueTemplateNode(value)
            ) : (
              <DefaultValueTemplate {...DefaultValueTemplateProps}>
                {disabled && placeholder
                  ? placeholder
                  : labels.length
                  ? labels.join(', ')
                  : emptyMessage}
              </DefaultValueTemplate>
            )}
          </ButtonStyled>
        )}
        {isOpen && <BackdropStyled onClick={handleClose} />}
        {isOpen && options && (
          <ContainerStyled
            style={{ left: pos?.x || 0, top: pos?.y || 0, ...itemStyle }}
            message={message || ''}
            isOpen={true}
            startAnimation={startAnimation}
            onSubmit={handleSearchSubmit}
          >
            {(search || editable) && (
              <SearchStyled>
                <Icon icon={'search'} />
                <InputText
                  value={searchForm}
                  onChange={(e) => setSearchForm(e.target.value)}
                  autoFocus
                  tabIndex={0}
                  ref={searchRef}
                  onKeyDown={(e) => e.code === 'Enter' && e.preventDefault()}
                />
              </SearchStyled>
            )}
            <OptionsStyled
              message={message || ''}
              search={!!search || !!editable}
              ref={optionsRef}
              style={{ minWidth, ...listStyle }}
            >
              {showOptions.map((option, i) => (
                <ListItemStyled
                  key={`${option[dataKey]}-${i}`}
                  onClick={(e) => handleChange(option[dataKey], i, e)}
                  focused={usingKeyboard && activeIndex === i}
                  usingKeyboard={usingKeyboard}
                >
                  {itemTemplate ? (
                    itemTemplate(
                      option,
                      value.includes(option[dataKey]),
                      selected.includes(option[dataKey]),
                    )
                  ) : (
                    <DefaultItemStyled isSelected={selected.includes(option[dataKey])}>
                      {option.icon && <Icon icon={option.icon} />}
                      <span>{option[dataLabel] || option[dataKey]}</span>
                    </DefaultItemStyled>
                  )}
                </ListItemStyled>
              ))}
              {!!hiddenLength && (
                <ListItemStyled
                  onClick={() => searchRef.current?.focus()}
                  focused={false}
                  usingKeyboard={false}
                >
                  <DefaultItemStyled isSelected={false}>
                    <span>{`Search ${hiddenLength} more...`}</span>
                  </DefaultItemStyled>
                </ListItemStyled>
              )}
            </OptionsStyled>
          </ContainerStyled>
        )}
      </DropdownStyled>
    )
  },
)
