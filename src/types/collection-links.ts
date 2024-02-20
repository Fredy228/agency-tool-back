export type CollectionLink = {
  title: string;
  url: string;
  favicon: string;
  image: string;
  createAt: Date;
  updateAt: Date;
};

export type CollectionDirectory = {
  name: string;
  links: CollectionLink[];
};

export type CollectionSection = {
  name: string;
  section: CollectionDirectory[];
};

export type CollectionDetail = CollectionSection[];
