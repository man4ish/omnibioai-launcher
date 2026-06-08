FROM codercom/code-server:latest
USER root
RUN apt-get update && apt-get install -y python3-pip r-base
RUN pip install scanpy anndata scvelo \
  pydeseq2 gseapy biopython pysam
RUN code-server --install-extension ms-python.python && \
  code-server --install-extension REditorSupport.r && \
  code-server --install-extension nextflow-io.nf-lang && \
  code-server --install-extension broadinstitute.wdl
USER coder
