

export enum PublishedStatuses {
  ALL = 'all',
  PUBLISHED = 'published',
  NOTPUBLISHED = 'notPublished',
}

export class UpdatePublishStatusInputModel {
  published: boolean
}
