import { CSSProperties, forwardRef, useEffect, RefObject } from 'react'
import { useState } from 'react'
import { useRef } from 'react'
import styled, { css, keyframes } from 'styled-components'
import { compact, isEqual, isNull } from 'lodash'
import { useMemo } from 'react'
import { InputText } from '../../Inputs/InputText'
import { Icon, IconType } from '../../Icon'
import { DefaultValueTemplate } from '.'
import TagsValueTemplate from './TagsValueTemplate'

/**
 * Hook that alerts clicks outside of the passed ref
 */
function useOutsideAlerter(refs: RefObject<HTMLElement>[], callback: () => void): void {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent): void {
      if (refs.every((ref) => ref.current && !ref.current.contains(event.target as Node))) {
        callback && callback()
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [refs, callback])
}

const ButtonStyled = styled.button<{
  $isChanged: boolean
  $isOpen: boolean
}>`
  /* remove defaults */
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  background-color: var(--color-grey-00);
  &:not(:focus) {
    border: inherit;
  }
  z-index: 12;
  position: relative;

  /* if isOpen and :focus-visible remove outline */
  ${({ $isOpen }: { $isOpen: boolean }) =>
    $isOpen &&
    css`
      &:focus-visible {
        outline: none;
      }
    `}

  &:hover {
    background-color: var(--color-grey-02);
  }

  border-radius: var(--border-radius);

  ${({ $isChanged }) =>
    $isChanged &&
    css`
      background-color: var(--color-hl-00);
      color: black;
      .icon {
        color: black;
      }

      :hover {
        filter: brightness(1.15);
        background-color: var(--color-hl-00);
      }
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      background-color: var(--input-disabled-background-color) !important;
      color: var(--color-text-dim);
      font-style: italic;

      .icon {
        opacity: 0.3;
      }
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
  $isOpen: boolean
  $height?: number
  $message: string
  $startAnimation: boolean
}>`
  width: 100%;
  position: relative;
  height: ${({ $height }) => `${$height}px`};
  width: auto;
  display: inline-block;
  height: min-content;

  position: fixed;
  z-index: 60;

  /* position: fixed; */

  /* hide when startAnimation false */
  ${({ $startAnimation }) =>
    !$startAnimation &&
    css`
      opacity: 0;
    `}

  /* show warning when changing multiple entities */
  ${({ $isOpen, $message }) =>
    $isOpen &&
    $message &&
    css`
      &::before {
        content: '${$message}';
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
        border: 1px solid #383838;
        justify-content: center;
      }
    `}
`

const dropdownMenuAnimation = (end: number) => keyframes`
  0% {
    max-height: 0;
    opacity: 0;
}
100% {
    max-height: ${end}px;
    opacity: 1;
}
`

export const OptionsStyled = styled.ul<{
  $message: string
  $search: boolean
  $startAnimation: boolean
  $animationHeight: number
  $maxHeight?: number
}>`
  width: auto;
  list-style-type: none;
  padding: unset;

  display: flex;
  flex-direction: column;

  margin: 0px;
  /* same border used as primereact dropdowns */
  border: 1px solid var(--color-grey-03);
  background-color: var(--color-grey-00);
  z-index: 20;
  border-radius: ${({ $message, $search }) =>
    $message || $search ? '0 0 var(--border-radius) var(--border-radius)' : 'var(--border-radius)'};
  overflow: clip;

  position: relative;

  /* fixes focus outline being cutoff for first item */
  padding-top: 1px;
  margin-top: -1px;

  /* move first child up by 1px to line up with list item (as it has no bottom border) */
  li:first-child {
    margin-top: -1px;
  }

  /* play animation on $startAnimation */
  ${({ $startAnimation, $animationHeight, $maxHeight }) =>
    $maxHeight &&
    ($startAnimation
      ? css`
          animation: ${dropdownMenuAnimation($animationHeight)} 0.17s ease-in-out forwards;
          max-height: ${$maxHeight}px;
        `
      : css`
          opacity: 0;
          max-height: ${$maxHeight}px;
        `)}

  overflow-y: scroll;

  ::-webkit-scrollbar {
    display: none;
  }
`

const slideDown = keyframes`
  0% {
    transform: translateY(-100%);
    opacity: 0;
}
100% {
    transform: translateY(0);
    opacity: 1;
}
`

export const ListItemStyled = styled.li<{
  $focused: boolean
  $usingKeyboard: boolean
  $startAnimation: boolean
  $disabled?: boolean
}>`
  cursor: pointer;

  ${({ $usingKeyboard, $disabled }) =>
    !$usingKeyboard &&
    (!$disabled
      ? css`
          &:hover {
            background-color: var(--color-grey-02);
          }
        `
      : css`
          cursor: not-allowed;
        `)}

  /* $focused */
  outline-offset: -1px;
  ${({ $focused }) =>
    $focused &&
    css`
      background-color: var(--color-grey-02);

      & > * {
        outline: solid #93cbf9 1px;
        outline-offset: -1px;
        border-radius: var(--border-radius);
      }
    `}

  /* start animation, slide down 100% height */
      ${({ $startAnimation }) =>
    $startAnimation &&
    css`
      animation: ${slideDown} 0.17s ease-in-out forwards;
    `}
`

export const DefaultItemStyled = styled.span<{
  $isSelected: boolean
}>`
  display: flex;
  gap: 8px;
  align-items: center;
  height: 30px;
  padding: 0 8px;

  ${({ $isSelected }) =>
    $isSelected &&
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
  .icon {
    position: absolute;
    left: 8px;
    top: 50%;
    translate: 0 -50%;
    z-index: 10;
    z-index: 40;
  }

  /* input */
  input {
    width: 100%;
    position: relative;
    height: 100%;
    text-indent: 35px;

    border-radius: var(--border-radius) var(--border-radius) 0 0;

    &:focus {
      /* outline: unset;
      border: 1px solid var(--color-hl-00); */
      outline-offset: -1px;
      z-index: 30;
    }

    opacity: 0;
    /* $startAnimation transition opacity 0 to 1 */
    ${({ $startAnimation }: { $startAnimation: boolean }) =>
      $startAnimation &&
      css`
        transition: opacity 0.05;
        opacity: 1;
      `}
  }
`

// types
export interface DropdownProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  message?: string
  itemStyle?: CSSProperties
  valueStyle?: CSSProperties
  listStyle?: CSSProperties
  buttonStyle?: CSSProperties
  onOpen?: () => void
  onClose?: () => void
  value: Array<string | number>
  valueTemplate?:
    | ((
        value: (string | number)[],
        selected: (string | number)[],
        isOpen: boolean,
      ) => React.ReactNode)
    | 'tags'
  dataKey?: string
  labelKey?: string
  options: Array<any>
  itemTemplate?: (
    option: any,
    isActive: boolean,
    isSelected: boolean,
    index: number,
  ) => React.ReactNode
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
  buttonClassName?: string
  itemClassName?: string
  valueClassName?: string
  listClassName?: string
  widthExpand?: boolean
  searchFields?: string[]
  minSelected?: number
  maxSelected?: number
  dropIcon?: IconType
  onClear?: () => void
  editable?: boolean
  maxHeight?: number
  disableReorder?: boolean
  disabledValues?: (string | number)[]
  listInline?: boolean
  disableOpen?: boolean
}

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      value: initialValue = [],
      valueTemplate,
      valueStyle,
      listStyle,
      dataKey = 'value',
      labelKey = 'label',
      options = [],
      itemTemplate,
      itemStyle,
      buttonStyle,
      searchFields = ['value'],
      valueIcon,
      message,
      disabled,
      onClose,
      onChange,
      onOpen,
      widthExpand = true,
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
      buttonClassName,
      itemClassName,
      valueClassName,
      listClassName,
      minSelected = 0,
      maxSelected,
      dropIcon = 'expand_more',
      onClear,
      editable,
      maxHeight = 300,
      disableReorder,
      disabledValues = [],
      listInline = false,
      disableOpen = false,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = useState<(string | number)[]>([])

    useEffect(() => {
      setValue(compact(initialValue))
    }, [initialValue])

    // value = useMemo(() => compact(value), [value])

    // if there are multiple but multiSelect is false
    if (!multiSelect && value.length > 1) {
      isMultiple = true
    }

    const [isOpen, setIsOpen] = useState(false)
    // Style states
    const [pos, setPos] = useState<{
      left?: number | null
      right?: number | null
      y: number | null
    }>({ left: null, right: null, y: 0 })
    const [startAnimation, setStartAnimation] = useState(false)
    const [startAnimationFinished, setStartAnimationFinished] = useState(false)
    const [optionsHeight, setOptionsHeight] = useState(0)
    const [minWidth, setMinWidth] = useState(0)
    // search
    const [searchForm, setSearchForm] = useState('')
    // selection
    const [selected, setSelected] = useState<(string | number)[]>([])
    // keyboard states
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const [usingKeyboard, setUsingKeyboard] = useState(false)

    const [maxShown, setMaxShown] = useState(maxOptionsShown)

    useEffect(() => {
      if (maxOptionsShown !== maxShown) {
        setMaxShown(maxOptionsShown)
      }
    }, [maxOptionsShown])

    // REFS
    const valueRef = useRef<HTMLButtonElement>(null)
    const optionsRef = useRef<HTMLUListElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    // const [optionsWidth, setOptionsWidth] = useState<null | number>(null)

    // USE EFFECTS
    // sets the correct position and height
    useEffect(() => {
      if (isOpen && valueRef.current && optionsRef.current) {
        const valueRec = valueRef.current.getBoundingClientRect()
        const valueWidth = valueRec.width
        const valueHeight = valueRec.height

        const optionsRec = optionsRef.current.getBoundingClientRect()
        const optionsHeight = optionsRec.height

        const left = valueRec.x
        const right = window.innerWidth - valueRec.x - valueWidth
        let y = valueRec.y + (listInline ? 0 : valueHeight)

        // check it's not vertically off screen
        if (optionsHeight + y + 20 > window.innerHeight) {
          y = window.innerHeight - optionsHeight - 20
        }

        if (align === 'right') {
          setPos({ y, right, left: null })
        } else {
          // first set position
          setPos({ left, y, right: null })
        }

        if (widthExpand) setMinWidth(valueWidth)

        // console.log(optionsHeight)

        // then start animation
        setStartAnimation(true)
        setOptionsHeight(optionsHeight)
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

        if (childBottom > parentHeight + 1) {
          // scroll down
          optionsRef.current?.scrollTo(
            0,
            optionsRef.current?.scrollTop + (childBottom - parentHeight),
          )
        } else if (childTop - 1 < 0) {
          // scroll up
          optionsRef.current?.scrollTo(0, optionsRef.current?.scrollTop + childTop - 1)
        }
      }
    }, [activeIndex, options, usingKeyboard, optionsRef])

    // if editable, merge current search into showOptions
    options = useMemo(() => {
      // add in any values that are not in options
      const selectedNotInOptions = value.filter((s) => !options.some((o) => o[dataKey] === s))
      const selectedNotInOptionsItems = selectedNotInOptions.map((s) => ({
        [labelKey]: s,
        [dataKey]: s,
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

    // reorder options to put active at the top (if not disabled)
    options = useMemo(
      () =>
        disableReorder
          ? options
          : [...options].sort((a, b) => value.indexOf(b[dataKey]) - value.indexOf(a[dataKey])),
      [value, options],
    )

    // if editable, merge current search into showOptions
    options = useMemo(() => {
      if (editable) {
        const searchItem = {
          [labelKey]: searchForm ? `Add new "${searchForm}"` : 'Type to add new items...',
          [dataKey]: searchForm,
          icon: 'add',
          className: 'add-new',
        }

        return [searchItem, ...options]
      } else return options
    }, [editable, searchForm, options])

    // HANDLERS

    const handleClose = (
      e?: React.MouseEvent<HTMLDivElement>,
      changeValue?: (string | number)[],
      outside?: boolean,
    ): void => {
      // changeValue is used on single select
      changeValue = changeValue || selected

      e?.stopPropagation()

      // close dropdown
      setIsOpen(false)
      // reset animation
      setStartAnimationFinished(false)

      // reset keyboard
      setActiveIndex(null)

      // callback
      onClose && onClose()

      // reset search
      setSearchForm('')

      // check if value has changed
      const isSame = isEqual(changeValue, value)

      if (isSame) {
        // if not isMultiple,
        if (!isMultiple) return

        if (outside) return
      }

      // commit changes
      onChange && onChange(changeValue)
      //   reset selected
      setSelected([])

      // focus on value
      valueRef.current?.focus()
    }

    const formRef = useRef<HTMLFormElement>(null)
    useOutsideAlerter([formRef, valueRef], () => handleClose(undefined, undefined, true))

    const handleChange = (
      value: string | number,
      index: number,
      e?: React.MouseEvent<HTMLLIElement>,
    ): void => {
      e?.stopPropagation()
      e?.preventDefault()

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
            if (maxSelected && maxSelected > 0) {
              if (maxSelected === 1) {
                // replace
                newSelected = [value]
              }
              // check if max selected
              if (newSelected.length > maxSelected) {
                // do nothing
                return
              }
            } else {
              // add
              newSelected.push(value)
            }
          }
        }
      }

      if (addingNew) {
        // focus on search
        searchRef.current?.focus()
      }

      // update temp value
      // update state
      setSelected(newSelected)
      // if not multi, close
      if (!multiSelect || (addingNew && searchForm) || maxSelected === 1)
        handleClose(undefined, newSelected)
    }

    const handleClear = () => {
      if (!onClear) return

      if (selected.length > minSelected) {
        setSelected([])
        onClear()
        setIsOpen(false)
      }
    }

    const handleOpen = (e: React.MouseEvent<HTMLButtonElement>): void => {
      // check if onClear was clicked
      if ((e.target as HTMLDivElement).id === 'clear') return handleClear()

      if (isOpen) {
        return handleClose()
      }

      if (disableOpen) return

      if (disabled) return
      e.stopPropagation()
      setIsOpen(!isOpen)

      onOpen && onOpen()
    }

    const handleSearchSubmit = (e: React.MouseEvent<HTMLFormElement>): void => {}

    // KEY BOARD CONTROL
    const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
      // NAVIGATE DOWN
      if (e.code === 'ArrowDown' || e.code === 'ArrowRight') {
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
      if ((e.code === 'ArrowUp' || e.code === 'ArrowLeft') && activeIndex !== null) {
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

      if (
        e.code === 'ArrowDown' ||
        e.code === 'ArrowUp' ||
        e.code === 'ArrowLeft' ||
        e.code === 'ArrowRight'
      ) {
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
          selectedValue && handleChange(selectedValue, activeIndex || 0)

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

    const handleShowMore = () => {
      setMaxShown(maxShown + 50)
    }

    const labels = useMemo(() => {
      const values = isOpen ? selected : value
      let result: any[] = []
      options.forEach((o) => {
        if (values.includes(o[dataKey])) {
          result.push(o[labelKey] || o[dataKey])
        }
      })
      return result
    }, [options, value, dataKey, labelKey, selected, isOpen])

    const displayIcon = useMemo(() => {
      if (!value.length || valueTemplate === 'tags') return null
      if (valueIcon) return valueIcon
      if (multiSelect && value.length > 1) return null
      if (options.length) return options[editable ? 1 : 0].icon
      return null
    }, [valueIcon, multiSelect, options])

    // splice to maxOptionsShown or 25 items
    let showOptions = useMemo(
      () => (search || editable ? [...options].splice(0, maxShown) : options),
      [options, maxShown],
    )

    let hiddenLength = useMemo(() => options.length - showOptions.length, [options, showOptions])

    const DefaultValueTemplateProps = {
      value: isOpen ? selected : value,
      isMultiple,
      dropIcon,
      displayIcon,
      onClear: onClear ? handleClear : undefined,
      style: valueStyle,
      placeholder,
      isOpen,
      setStartAnimationFinished,
      className: valueClassName,
    }

    // filter out valueTemplate
    const valueTemplateNode = useMemo(() => {
      if (typeof valueTemplate === 'function') return valueTemplate
      if (valueTemplate === 'tags')
        return () => <TagsValueTemplate {...DefaultValueTemplateProps} />
    }, [valueTemplate, value, isOpen, onClear, selected, handleClear, isMultiple, dropIcon])

    return (
      <DropdownStyled
        onKeyDown={handleKeyPress}
        onMouseMove={() => usingKeyboard && setUsingKeyboard(false)}
        style={style}
        className={`dropdown ${className}`}
        ref={ref}
        {...props}
      >
        {value && (
          <ButtonStyled
            ref={valueRef}
            onClick={handleOpen}
            disabled={disabled}
            $isChanged={!!isChanged}
            $isOpen={isOpen}
            style={buttonStyle}
            className={`button ${buttonClassName}`}
          >
            {valueTemplateNode ? (
              valueTemplateNode(value, selected, isOpen)
            ) : (
              <DefaultValueTemplate {...DefaultValueTemplateProps}>
                {!labels.length && disabled && placeholder
                  ? placeholder
                  : labels.length
                  ? labels.join(', ')
                  : emptyMessage}
              </DefaultValueTemplate>
            )}
          </ButtonStyled>
        )}
        {isOpen && options && (
          <ContainerStyled
            style={{
              left: pos?.left || 'unset',
              right: pos?.right || 'unset',
              top: pos?.y || 'unset',
              ...itemStyle,
            }}
            $message={message || ''}
            $isOpen={true}
            onSubmit={handleSearchSubmit}
            $startAnimation={startAnimation}
            ref={formRef}
          >
            {(search || editable) && (
              <SearchStyled $startAnimation={startAnimation} className="search">
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
              $message={message || ''}
              $search={!!search || !!editable}
              ref={optionsRef}
              style={{ minWidth, ...listStyle }}
              $startAnimation={startAnimation}
              $animationHeight={optionsHeight}
              $maxHeight={maxHeight}
              onAnimationEnd={() => setStartAnimationFinished(true)}
              className={'options'}
            >
              {showOptions.map((option, i) => (
                <ListItemStyled
                  key={`${option[dataKey]}-${i}`}
                  onClick={(e) =>
                    !disabledValues.includes(option[dataKey]) && handleChange(option[dataKey], i, e)
                  }
                  $focused={usingKeyboard && activeIndex === i}
                  $usingKeyboard={usingKeyboard}
                  $startAnimation={
                    startAnimation && !startAnimationFinished && (search || editable || i !== 0)
                  }
                  tabIndex={0}
                  className={`option ${listClassName}`}
                  $disabled={disabledValues.includes(option[dataKey])}
                >
                  {itemTemplate ? (
                    itemTemplate(
                      option,
                      value.includes(option[dataKey]),
                      selected.includes(option[dataKey]),
                      i,
                    )
                  ) : (
                    <DefaultItemStyled
                      $isSelected={selected.includes(option[dataKey])}
                      className={`option-child ${
                        value.includes(option[dataKey]) ? 'selected' : ''
                      } ${value.includes(option[dataKey]) ? 'active' : ''} ${itemClassName}`}
                      style={itemStyle}
                    >
                      {option.icon && <Icon icon={option.icon} />}
                      <span>{option[labelKey] || option[dataKey]}</span>
                    </DefaultItemStyled>
                  )}
                </ListItemStyled>
              ))}
              {!!hiddenLength && (
                <ListItemStyled
                  onClick={handleShowMore}
                  $focused={false}
                  $usingKeyboard={false}
                  $startAnimation={startAnimation}
                  className="option"
                >
                  <DefaultItemStyled $isSelected={false} className="option-child hidden">
                    <span>{`Show ${50} more...`}</span>
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
