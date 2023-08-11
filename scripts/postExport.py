#!/usr/bin/env python3
import os
import pathlib
import shutil

BASE_DIR = pathlib.Path(os.path.dirname(os.path.realpath(__file__))).parent / 'out'

def removeOptionally(path):
    try:
        os.remove(path)
    except (FileNotFoundError):
        print(f'{path} did not exit')

def removeDirsExcept(dirPath, subDirsToKeep):
    subDirsToKeep = list(map(lambda s: pathlib.Path(s), subDirsToKeep))
    for child in dirPath.iterdir():
        if (child.relative_to(dirPath) not in subDirsToKeep):
            print(f'removing child dir {child}')
            shutil.rmtree(child)

def main():
    removeOptionally(BASE_DIR / '404.html')
    removeDirsExcept(BASE_DIR / '_next', ['static'])
    removeDirsExcept(BASE_DIR / '_next' / 'static', ['css', 'media'])
    # sanity check that no other references to _next/ exist in the remaining files

if __name__ == '__main__':
    main()
