import type { Meta, StoryObj } from '@storybook/react'
import { Modal } from '.'
import { useRef, useState } from 'react'
import { Button } from '../../Button'

const meta: Meta<typeof Modal> = {
  component: Modal,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof Modal>

// const payload = {
//   message: 'Are you sure you want to discard your changes?',
//   header: 'Confirmation',
//   icon: 'pi pi-exclamation-triangle',
//   accept: () => {
//     setIsOpen(false)
//     setEditorValue('')
//   },
// }

const HeaderContent = () => (
    <div>This is title of modal</div>
)

const BodyContent = () => (
  <>
    <div>Are you sure you want to permanently delete this folder and all its associated tasks, products, versions, representations, and workfiles?</div>
  </>
)

const FooterContent = () => <span>Ynput is awesome. Copyright ©2024 Ynput</span>

const closeProps = {
  label: 'Close'
}



const Template = () => {

  const [openModal, setOpenModal] = useState(false)

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  
  return (
    <>
      <Button onClick={() => setOpenModal(!openModal)} icon="open_in_full">
        Show Modal
      </Button>
      <Modal 
        header={<HeaderContent/>}
        children={<BodyContent />}
        // footer={<FooterContent />}
        isOpen={openModal}
        onClose={handleCloseModal}
        closeProps={closeProps}
        hideCancelButton={false}
        // classNames={{header: 'alert'}} 
      />
    </>
  )
}

export const Default: Story = {
  render: () => Template(),
}
