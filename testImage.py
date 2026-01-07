import subprocess
from pathlib import Path

# -----------------------------
# Configurable environment variables
# -----------------------------
image_base = "lre-harness-node-java-app"
image_version = "1.0"
image_name = f"{image_base}:{image_version}"

# Test-specific environment variables
env_vars = {
    "PLUGIN_LRE_ACTION": "ExecuteLreTest",
    "PLUGIN_LRE_DESCRIPTION": "running new test",
    "PLUGIN_LRE_SERVER": "<LREServer>/?tenant=fa128c06-5436-413d-9cfa-9f04bb738df3",
    "PLUGIN_LRE_HTTPS_PROTOCOL": "false",
    "PLUGIN_LRE_AUTHENTICATE_WITH_TOKEN": "false",
    "PLUGIN_LRE_USERNAME": "<username>",
    "PLUGIN_LRE_PASSWORD": "<password>",
    "PLUGIN_LRE_DOMAIN": "<domain>",
    "PLUGIN_LRE_PROJECT": "<project>",
    "PLUGIN_LRE_TEST": "<testid>",
    "PLUGIN_LRE_TEST_INSTANCE": "",
    "PLUGIN_LRE_TIMESLOT_DURATION_HOURS": "0",
    "PLUGIN_LRE_TIMESLOT_DURATION_MINUTES": "30",
    "PLUGIN_LRE_POST_RUN_ACTION": "Collate and Analyze",
    "PLUGIN_LRE_VUDS_MODE": "false",
    "PLUGIN_LRE_TREND_REPORT": "5",
    "PLUGIN_LRE_SEARCH_TIMESLOT": "false",
    "PLUGIN_LRE_STATUS_BY_SLA": "false",
    "PLUGIN_LRE_OUTPUT_DIR": "/harness/output",
    "PLUGIN_LRE_WORKSPACE_DIR": "/harness/workspace",
    "PLUGIN_LRE_ENABLE_STACKTRACE": "false",
}


def windows_path_for_docker(path: str) -> str:
    """Convert Windows path to Docker-friendly forward slash path"""
    return Path(path).resolve().as_posix()


def run_test_container():
    print(f"Beginning running a test using container of image {image_name} ...")

    # Docker volume mappings
    volumes = [
        f"{windows_path_for_docker('C:/temp/harness/output')}:/harness/output",
        f"{windows_path_for_docker('C:/temp/harness/workspace')}:/harness/workspace",
    ]

    # Build docker run command
    cmd = ["docker", "run", "-it", "--rm"]

    # Add volume mappings
    for vol in volumes:
        cmd += ["-v", vol]

    # Add environment variables
    for key, value in env_vars.items():
        cmd += ["-e", f"{key}={value}"]

    # Add image name
    cmd.append(image_name)

    # Run the docker command
    print("> Running Docker container...")
    subprocess.run(cmd, shell=True, check=True)

    print(f"Finished running a test using container of image {image_name} ...")


if __name__ == "__main__":
    run_test_container()
