FROM codercom/code-server:latest
USER root
RUN apt-get update && apt-get install -y \
    python3-pip r-base curl git && \
    rm -rf /var/lib/apt/lists/*
RUN pip install --break-system-packages --no-cache-dir \
    scanpy anndata scvelo pydeseq2 \
    gseapy biopython pysam
RUN code-server --install-extension ms-python.python 2>/dev/null || true
RUN code-server --install-extension REditorSupport.r 2>/dev/null || true
USER coder
