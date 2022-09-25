import { expect } from 'chai'
import { fireEvent, screen } from '@testing-library/react'
import DeleteProjectButton from '../../../../../../../../frontend/js/features/project-list/components/table/cells/action-buttons/delete-project-button'
import {
  archiveableProject,
  trashedAndNotOwnedProject,
  trashedProject,
} from '../../../../fixtures/projects-data'
import fetchMock from 'fetch-mock'
import {
  renderWithProjectListContext,
  resetProjectListContextFetch,
} from '../../../../helpers/render-with-context'

describe('<DeleteProjectButton />', function () {
  afterEach(function () {
    resetProjectListContextFetch()
  })

  it('renders tooltip for button', function () {
    window.user_id = trashedProject?.owner?.id
    renderWithProjectListContext(
      <DeleteProjectButton project={trashedProject} />
    )
    const btn = screen.getByLabelText('Delete')
    fireEvent.mouseOver(btn)
    screen.getByRole('tooltip', { name: 'Delete' })
  })

  it('does not render button when trashed and not owner', function () {
    window.user_id = '123abc'
    renderWithProjectListContext(
      <DeleteProjectButton project={trashedAndNotOwnedProject} />
    )
    const btn = screen.queryByLabelText('Delete')
    expect(btn).to.be.null
  })

  it('does not render the button when project is current', function () {
    renderWithProjectListContext(
      <DeleteProjectButton project={archiveableProject} />
    )
    expect(screen.queryByLabelText('Delete')).to.be.null
  })

  it('opens the modal and deletes the project', async function () {
    window.user_id = trashedProject?.owner?.id
    const project = Object.assign({}, trashedProject)
    fetchMock.delete(
      `express:/project/${project.id}`,
      {
        status: 200,
      },
      { delay: 0 }
    )
    renderWithProjectListContext(<DeleteProjectButton project={project} />)
    const btn = screen.getByLabelText('Delete')
    fireEvent.click(btn)
    screen.getByText('Delete Projects')
    screen.getByText('You are about to delete the following projects:')
    screen.getByText('This action cannot be undone.')
    const confirmBtn = screen.getByText('Confirm') as HTMLButtonElement
    fireEvent.click(confirmBtn)
    expect(confirmBtn.disabled).to.be.true
    // verify trashed
    await fetchMock.flush(true)
    expect(fetchMock.done()).to.be.true
    const requests = fetchMock.calls()
    // first request is project list api in projectlistcontext
    const [requestUrl, requestHeaders] = requests[1]
    expect(requestUrl).to.equal(`/project/${project.id}`)
    expect(requestHeaders?.method).to.equal('DELETE')
    fetchMock.reset()
  })
})
