@echo off
REM Activate virtual environment and run backend tests with coverage
call .venv\Scripts\activate
python -m pytest tests/ -v --cov=app --cov-report=xml
pause
