from setuptools import setup, find_packages
import sys

if sys.version_info[0:2] != (3, 6):
    raise ImportError(
        "cellxgene currently only supports python 3.6. Python 3.7 is known to fail; we will look at supporting "
        "versions other than 3.6 in the future."
        "See https://github.com/chanzuckerberg/cellxgene#conda-and-virtual-environments "
        "for more help with installation."
    )

with open("README.md", "rb") as fh:
    long_description = fh.read().decode()

with open("server/requirements.txt") as fh:
    requirements = fh.read().splitlines()

setup(
    name="cellxgene",
    version="0.5.1",
    packages=find_packages(),
    url="https://github.com/chanzuckerberg/cellxgene",
    license="MIT",
    author="Colin Megill, Charlotte Weaver",
    author_email="cweaver@chanzuckerberg.com",
    description="Web application for exploration of large scale scRNA-seq datasets",
    long_description=long_description,
    long_description_content_type="text/markdown",
    install_requires=requirements,
    include_package_data=True,
    zip_safe=False,
    classifiers=[
        "Framework :: Flask",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: MIT License",
        "Natural Language :: English",
        "Operating System :: POSIX",
        "Operating System :: Unix",
        "Operating System :: MacOS :: MacOS X",
        "Programming Language :: JavaScript",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3 :: Only",
        "Topic :: Scientific/Engineering :: Bio-Informatics",
    ],
    entry_points={"console_scripts": ["cellxgene = server.cli.cli:cli"]},
    extras_require=dict(louvain=["python-igraph", "louvain>=0.6"]),
)
