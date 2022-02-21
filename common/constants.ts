import path from 'path';
import process from 'process';

// TODO: Work on better namespace solution/pattern for the constants.
//       I want a good distinction between:
//       - directory vs endpoint
//       - local filesystem path vs url path

export const PROCESS_WORKING_DIR   = process.cwd();

export const STATIC_ASSET_DIR : string = path.join(PROCESS_WORKING_DIR, 'public');

export const GALLERY_URL_BASEPATH       = '/galleries';
export const PRACTICEFILES_URL_BASEPATH = '/assets/practiceFiles';

// TODO: Convert GALLERY_ASSET_BASEPATH into GALLERY_ASSET_DIR (inluding /galleries segment)
export const GALLERY_ASSET_BASEPATH = STATIC_ASSET_DIR;

// TODO: collect important constants into a single common file of constants

export const DATA_DIR              = 'data';

export const FYLP_DATA_DIR         = path.join(DATA_DIR, 'fylp')
export const GALLERY_DATA_DIR      = path.join(DATA_DIR, 'galleries')
export const PERFORMANCE_DATA_DIR  = path.join(DATA_DIR, 'performances')
export const SUPPLEMENT_DATA_DIR   = path.join(DATA_DIR, 'pieceSupplements')
