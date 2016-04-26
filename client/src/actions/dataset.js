import * as constants from '../constants/dataset';
import { hideModal } from './activeModal';
import headers from './headers';

/*
 * Fetch a dataset by id
 * fetchDataset(id)
 * Actions:
 * - FETCH_DATASET_REQUEST { id }
 * - FETCH_DATASET_SUCCESS { dataset }
 * - FETCH_DATASET_FAILURE { error, id }
 */
function fetchDatasetRequest(id) {
  return {
    type: constants.FETCH_DATASET_REQUEST,
    id,
  };
}

function fetchDatasetSuccess(dataset) {
  return {
    type: constants.FETCH_DATASET_SUCCESS,
    dataset,
  };
}

function fetchDatasetFailure(error, id) {
  return {
    type: constants.FETCH_DATASET_FAILURE,
    id,
  };
}

export function fetchDataset(id) {
  return (dispatch) => {
    dispatch(fetchDatasetRequest(id));
    fetch(`/api/datasets/${id}`, {
      method: 'GET',
      headers: headers(),
    })
    .then(response => response.json())
    .then(dataset => dispatch(fetchDatasetSuccess(dataset)))
    .catch(error => dispatch(fetchDatasetFailure(error, id)));
  };
}

/*
 * Dataset import
 * importDataset(dataSource)
 * Actions:
 * IMPORT_DATASET_REQUEST
 * IMPORT_DATASET_SUCCESS
 * IMPORT_DATASET_FAILURE
 */

function importDatasetFailure(importId, reason) {
  return {
    type: constants.IMPORT_DATASET_FAILURE,
    importId,
    reason,
  };
}

function importDatasetSuccess(datasetId) {
  return (dispatch) => {
    dispatch(fetchDataset(datasetId));
    dispatch({
      type: constants.IMPORT_DATASET_SUCCESS,
      datasetId,
    });
  };
}

const pollInteval = 1000;
function pollDatasetImportStatus(importId) {
  return (dispatch) => {
    fetch(`/api/datasets/import/${importId}`, {
      method: 'GET',
      headers: headers(),
    })
    .then(response => response.json())
    .then(({ status, reason, datasetId }) => {
      if (status === 'PENDING') {
        setTimeout(() => dispatch(pollDatasetImportStatus(importId)), pollInteval);
      } else if (status === 'FAILED') {
        dispatch(importDatasetFailure(importId, reason));
      } else if (status === 'OK') {
        dispatch(importDatasetSuccess(datasetId));
      }
    })
    .catch(error => dispatch(error));
  };
}

function importDatasetRequest(dataSource) {
  return {
    type: constants.IMPORT_DATASET_REQUEST,
    dataSource,
  };
}

export function clearImport() {
  return {
    type: constants.CLEAR_IMPORT,
  };
}

export function importDataset(dataSource) {
  return (dispatch) => {
    dispatch(importDatasetRequest(dataSource));
    fetch('/api/datasets', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(dataSource),
    })
    .then(response => response.json())
    .then(importStatus => {
      dispatch(pollDatasetImportStatus(importStatus.importId));
      dispatch(hideModal());
      dispatch(clearImport());
    })
    .catch(() => dispatch(importDatasetFailure('Unable to start import process', dataSource)));
  };
}

/*
 *
 */

// Currently only name
export function saveDatasetSettings(id, { name }) {
  return {
    type: constants.SAVE_SETTINGS,
    dataset: {
      id,
      name,
    },
  };
}

// Only name for now.
export function defineDatasetSettings({ name }) {
  return {
    type: constants.DEFINE_DATASET_SETTINGS,
    dataset: { name },
  };
}

export function selectDataSource(dataSource) {
  return {
    type: constants.SELECT_DATA_SOURCE,
    dataSource,
  };
}

export function nextPage() {
  return {
    type: constants.NEXT_PAGE,
  };
}

export function previousPage() {
  return {
    type: constants.PREVIOUS_PAGE,
  };
}

export function defineDataSource(dataSource) {
  return {
    type: constants.DEFINE_DATA_SOURCE,
    dataSource,
  };
}

export function fetchDatasetsSuccess(datasets) {
  return {
    type: constants.FETCH_DATASETS_SUCCESS,
    datasets,
  };
}