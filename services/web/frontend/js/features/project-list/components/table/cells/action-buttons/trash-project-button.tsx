import { useTranslation } from 'react-i18next'
import { memo, useCallback, useState } from 'react'
import { Project } from '../../../../../../../../types/project/dashboard/api'
import Icon from '../../../../../../shared/components/icon'
import Tooltip from '../../../../../../shared/components/tooltip'
import ProjectsActionModal from '../../projects-action-modal'
import useIsMounted from '../../../../../../shared/hooks/use-is-mounted'
import { useProjectListContext } from '../../../../context/project-list-context'
import { trashProject } from '../../../../util/api'

type TrashProjectButtonProps = {
  project: Project
}

function TrashProjectButton({ project }: TrashProjectButtonProps) {
  const { updateProjectViewData } = useProjectListContext()
  const { t } = useTranslation()
  const text = t('trash')
  const [showModal, setShowModal] = useState(false)
  const isMounted = useIsMounted()

  const handleOpenModal = useCallback(() => {
    setShowModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    if (isMounted.current) {
      setShowModal(false)
    }
  }, [isMounted])

  const handleTrashProject = useCallback(async () => {
    await trashProject(project.id)

    // update view
    project.trashed = true
    project.archived = false
    updateProjectViewData(project)
  }, [project, updateProjectViewData])

  if (project.trashed) return null

  return (
    <>
      <Tooltip
        key={`tooltip-trash-project-${project.id}`}
        id={`tooltip-trash-project-${project.id}`}
        description={text}
        overlayProps={{ placement: 'top', trigger: ['hover', 'focus'] }}
      >
        <button
          className="btn btn-link action-btn"
          aria-label={text}
          onClick={handleOpenModal}
        >
          <Icon type="trash" />
        </button>
      </Tooltip>

      <ProjectsActionModal
        action="trash"
        actionHandler={handleTrashProject}
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        projects={[project]}
      />
    </>
  )
}

export default memo(TrashProjectButton)
