import { Project } from '../../../../../types/project/dashboard/api'
const moment = require('moment')

const users = {
  laforge: {
    id: '624371e98a21dd0026a5bfef',
    email: 'laforge@overleaf.com',
    firstName: '',
    lastName: 'La Forge',
  },
  picard: {
    id: '62d6d0b4c5c5030a4d696c7a',
    email: 'picard@overleaf.com',
    firstName: 'Jean-Luc',
    lastName: 'Picard',
  },
  riker: {
    id: '624333f147cfd8002622a1d3',
    email: 'riker@overleaf.com',
    firstName: 'William',
    lastName: 'Riker',
  },
  worf: {
    id: '624371708a21dd0026a5bf86',
    email: 'worf@overleaf.com',
    firstName: '',
    lastName: '',
  },
}

export const copyableProject = <Project>{
  id: '62f17f594641b405ca2b3264',
  name: 'Starfleet Report (owner)',
  lastUpdated: moment().subtract(1, 'day').toDate(),
  lastUpdatedBy: users.picard,
  accessLevel: 'owner',
  source: 'owner',
  archived: false,
  trashed: false,
  owner: users.riker,
}

export const archiveableProject = <Project>{
  id: '62d6d3721357e20a682110d5',
  name: "Captain's logs (Invite & Read Only)",
  lastUpdated: moment().subtract(1, 'week').toDate(),
  lastUpdatedBy: users.picard,
  accessLevel: 'readOnly',
  source: 'invite',
  archived: false,
  trashed: false,
  owner: users.picard,
}

export const trashedProject = <Project>{
  id: '42f17f594641b405ca2b3265',
  name: 'Starfleet Report draft (owner & trashed)',
  lastUpdated: moment().subtract(2, 'year').toDate(),
  lastUpdatedBy: users.picard,
  accessLevel: 'owner',
  source: 'owner',
  archived: false,
  trashed: true,
  owner: users.riker,
}

export const archivedProject = <Project>{
  id: '52f17f594641b405ca2b3266',
  name: 'Starfleet Report old (owner & archive)',
  lastUpdated: moment().subtract(1, 'year').toDate(),
  lastUpdatedBy: users.picard,
  accessLevel: 'owner',
  source: 'owner',
  archived: true,
  trashed: false,
  owner: users.riker,
}

export const trashedAndNotOwnedProject = <Project>{
  id: '62d6d3721357e20a682110d5',
  name: "Captain's logs very old (Trashed & Read Only & Not Owned)",
  lastUpdated: moment().subtract(11, 'year').toDate(),
  lastUpdatedBy: users.picard,
  accessLevel: 'readOnly',
  source: 'invite',
  archived: false,
  trashed: true,
  owner: users.picard,
}

export const sharedProject = archiveableProject

export const projectsData: Array<Project> = [
  copyableProject,
  archiveableProject,
  {
    id: '62b5cdf85212090c2244161c',
    name: 'Enterprise Security Analysis | Deflector Shields, Sensors, Tractor Beams, and Cloaking Devices (Invite & Edit)',
    lastUpdated: moment().subtract(1, 'month').toDate(),
    lastUpdatedBy: users.worf,
    accessLevel: 'readWrite',
    source: 'invite',
    archived: false,
    trashed: false,
    owner: users.worf,
  },
  {
    id: '624380431c2e40006c59b922',
    name: 'VISOR Sensors (Link Sharing & Edit)',
    lastUpdated: moment().subtract(2, 'months').toDate(),
    lastUpdatedBy: users.laforge,
    accessLevel: 'readAndWrite',
    source: 'token',
    archived: false,
    trashed: false,
    owner: users.laforge,
  },
  {
    id: '62f51b31f6f4c60027e8935f',
    name: 'United Federation of Planets (Link Sharing & View Only)',
    lastUpdated: moment().subtract(2, 'year').toDate(),
    lastUpdatedBy: null,
    accessLevel: 'readOnly',
    source: 'token',
    archived: false,
    trashed: false,
  },
  archivedProject,
  trashedProject,
]

export const currentProjects: Array<Project> = projectsData.filter(
  ({ archived, trashed }) => !archived && !trashed
)
