import styled, { css } from 'styled-components'

interface DroppableStyledProps {
  $isOver: boolean
  $isOverSelf: boolean
  $active: boolean
}

export const Column = styled.div<DroppableStyledProps>`
  --min-height: 125px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  height: min-content;
  min-height: var(--min-height);
  min-width: min-content;
  max-height: -webkit-fill-available;
  padding: 0;

  border-radius: 16px;
  background-color: var(--md-sys-color-surface-container-lowest);

  /* when a card is hovering over the top */
  .items > *:last-child {
    margin-bottom: 0;
    transition: margin-bottom 0.1s ease-in-out;
  }
  ${({ $isOverSelf, $isOver }) =>
    $isOver &&
    !$isOverSelf &&
    css`
      /* last child margin bottom */
      .items {
        & > *:last-child {
          margin-bottom: calc(var(--min-height) - 8px);
        }
      }
    `}

  ${({ $isOver }) =>
    $isOver &&
    css`
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background-color: white;
        opacity: 0.05;
        z-index: 500;
        border-radius: 16px;
      }
    `}
`

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;

  h3 {
    margin: 0;
  }
`

interface ItemsProps {
  $isScrolling: boolean
  $isColumnActive: boolean
  $active: boolean
}

export const Items = styled.div<ItemsProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px;
  padding-top: 0;
  padding-bottom: ${({ $isScrolling }) => ($isScrolling ? '30px' : '8px')};
  /* remove padding when scroll bar visible */
  padding-right: ${({ $isScrolling }) => ($isScrolling ? '0' : '8px')};

  overflow-x: hidden;
  overflow-y: auto;
  overflow-y: overlay;

  ${({ $isColumnActive, $isScrolling }) =>
    $isColumnActive &&
    css`
      /* so we can see the moving card */
      overflow: visible;
      /* add extra padding if it was previously scrolling to prevent width change */
      padding-right: ${$isScrolling ? '16px' : '8px'};
    `}

  /* for columns that aren't active */
    ${({ $active, $isColumnActive, $isScrolling }) =>
    $active &&
    !$isColumnActive &&
    !$isScrolling &&
    css`
      overflow: hidden;
      padding-right: 8px;
    `}

  &::-webkit-scrollbar {
    width: unset;
  }
`
