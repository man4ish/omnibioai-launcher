FROM jupyter/datascience-notebook:latest
USER root
RUN pip install --no-cache-dir \
  scanpy anndata scvelo squidpy \
  pydea gseapy biopython pysam \
  cellxgene leidenalg harmonypy \
  decoupler pydeseq2 omnipath
RUN conda install -y -c bioconda \
  bioconductor-deseq2 bioconductor-edger \
  bioconductor-limma r-seurat
USER jovyan
