from pathlib import Path


def test_requirements_include_pandas_for_export_script():
    requirements = Path("requirements.txt").read_text().splitlines()
    normalized = [line.strip() for line in requirements if line.strip() and not line.startswith("#")]
    assert any(dep.startswith("pandas") for dep in normalized)
