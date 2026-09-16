export type PlantedCropFormValue = {
  id?: string;
  key?: string;
  name: string;
};

export type HarvestFormValue = {
  id?: string;
  key?: string;
  name: string;
  plantedCrops: PlantedCropFormValue[];
};
