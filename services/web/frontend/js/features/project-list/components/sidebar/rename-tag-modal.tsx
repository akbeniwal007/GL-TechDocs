import { useCallback, useEffect, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Tag } from '../../../../../../app/src/Features/Tags/types'
import AccessibleModal from '../../../../shared/components/accessible-modal'
import useAsync from '../../../../shared/hooks/use-async'
import { renameTag } from '../../util/api'
import { MAX_TAG_LENGTH } from '../../util/tag'

type RenameTagModalProps = {
  tag?: Tag
  onRename: (tagId: string, newTagName: string) => void
  onClose: () => void
}

export default function RenameTagModal({
  tag,
  onRename,
  onClose,
}: RenameTagModalProps) {
  const { t } = useTranslation()
  const { isError, runAsync, status } = useAsync()

  const [newTagName, setNewTageName] = useState<string>()
  const [validationError, setValidationError] = useState<string>()

  const runRenameTag = useCallback(
    (tagId: string) => {
      if (newTagName) {
        runAsync(renameTag(tagId, newTagName))
          .then(() => onRename(tagId, newTagName))
          .catch(console.error)
      }
    },
    [runAsync, newTagName, onRename]
  )

  const handleSubmit = useCallback(
    e => {
      e.preventDefault()
      if (tag) {
        runRenameTag(tag._id)
      }
    },
    [tag, runRenameTag]
  )

  useEffect(() => {
    if (newTagName && newTagName.length > MAX_TAG_LENGTH) {
      setValidationError(
        t('tag_name_cannot_exceed_characters', { maxLength: MAX_TAG_LENGTH })
      )
    } else if (validationError) {
      setValidationError(undefined)
    }
  }, [newTagName, t, validationError])

  if (!tag) {
    return null
  }

  return (
    <AccessibleModal
      show
      animation
      onHide={onClose}
      id="rename-tag-modal"
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>{t('rename_folder')}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form name="renameTagForm" onSubmit={handleSubmit}>
          <input
            className="form-control"
            type="text"
            placeholder="Tag Name"
            name="new-tag-name"
            value={newTagName === undefined ? tag.name : newTagName}
            required
            onChange={e => setNewTageName(e.target.value)}
          />
        </Form>
      </Modal.Body>

      <Modal.Footer>
        {validationError && (
          <div className="modal-footer-left">
            <span className="text-danger error">{validationError}</span>
          </div>
        )}
        {isError && (
          <div className="modal-footer-left">
            <span className="text-danger error">
              {t('generic_something_went_wrong')}
            </span>
          </div>
        )}
        <Button onClick={onClose} disabled={status === 'pending'}>
          {t('cancel')}
        </Button>
        <Button
          onClick={() => runRenameTag(tag._id)}
          bsStyle="primary"
          disabled={
            status === 'pending' || !newTagName?.length || !!validationError
          }
        >
          {status === 'pending' ? t('renaming') + '…' : t('rename')}
        </Button>
      </Modal.Footer>
    </AccessibleModal>
  )
}
