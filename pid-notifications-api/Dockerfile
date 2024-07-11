# Use the official Python base image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the poetry.lock and pyproject.toml files to the container
COPY poetry.lock pyproject.toml ./

# Install additional packages
RUN apt-get update && apt-get install -y 

# Install Poetry
RUN pip install poetry

# Install project dependencies
RUN poetry install --no-interaction --no-ansi --no-root --no-dev

# Copy the rest of the project files to the container
COPY . .

# Expose the port that the FastAPI application will run on
EXPOSE 9000

# Start the FastAPI application
CMD ["poetry", "run", "start","--host", "0.0.0.0", "--port", "9000"]