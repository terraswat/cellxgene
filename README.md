# fork of cellxgene

This is an experimental fork of [CZI's cellxgene](https://github.com/chanzuckerberg/cellxgene).

Build the client web assets by calling this from inside the `cellxgene` folder

```
./bin/build-client
```

Install all requirements after python 3.6 is installed.
A virtual environment is recommended and shown here.

```
VENV=../
virtualenv -p `which python3` $VENV
source $VENV/bin/activate
pip install -e .
```

One way to start the python server and the client app during development. The
python server:

```
cd cellxgene
cellxgene launch pbmc3k.h5ad
```

The client in another terminal:

```
cd cellxgene
npm dev
npm start
```
