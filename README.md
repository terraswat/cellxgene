# fork of cellxgene

This is an experimental fork of 
[CZI's cellxgene](https://github.com/chanzuckerberg/cellxgene).

To get a development environment up:

Build the client web assets by calling this from inside the `cellxgene` folder

```
./bin/build-client
```

Install all requirements after python 3.6, node and npm is installed.
A virtual environment is recommended and shown here.

```
VENV=../venv
virtualenv -p `which python3` $VENV
source $VENV/bin/activate
pip install -e .
```

Start it up:

```
cd cellxgene
source $VENV/bin/activate
cellxgene launch pbmc3k.h5ad
```

Or launch in development mode:

```
cd cellxgene/client
npm start
```
