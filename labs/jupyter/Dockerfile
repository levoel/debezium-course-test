# JupyterLab for Debezium CDC Labs
# Extends official Jupyter image with Kafka client and data engineering libraries

FROM jupyter/scipy-notebook:latest

LABEL maintainer="Debezium Course"
LABEL description="JupyterLab environment for CDC exercises"

# Install additional Python packages as user (not root)
COPY --chown=${NB_UID}:${NB_GID} requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Set working directory to mounted notebooks volume
WORKDIR /home/jovyan/work

# Expose JupyterLab port
EXPOSE 8888

# Default command (can be overridden)
CMD ["start-notebook.sh", "--NotebookApp.token=''", "--NotebookApp.password=''"]
