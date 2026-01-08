import os
import subprocess
from pathlib import Path

# -----------------------------
# Docker image metadata
# -----------------------------
image_name = os.getenv("IMAGE_NAME", "lre-harness-node-java-app:latest")

# -----------------------------
# Environment variables
# -----------------------------
# Read from current environment (so GitHub secrets work)
env_vars = {
    key: os.environ.get(key, "")
    for key in [
        "PLUGIN_LRE_ACTION",
        "PLUGIN_LRE_DESCRIPTION",
        "PLUGIN_LRE_SERVER",
        "PLUGIN_LRE_HTTPS_PROTOCOL",
        "PLUGIN_LRE_AUTHENTICATE_WITH_TOKEN",
        "PLUGIN_LRE_USERNAME",
        "PLUGIN_LRE_PASSWORD",
        "PLUGIN_LRE_DOMAIN",
        "PLUGIN_LRE_PROJECT",
        "PLUGIN_LRE_TEST",
        "PLUGIN_LRE_TEST_INSTANCE",
        "PLUGIN_LRE_TIMESLOT_DURATION_HOURS",
        "PLUGIN_LRE_TIMESLOT_DURATION_MINUTES",
        "PLUGIN_LRE_POST_RUN_ACTION",
        "PLUGIN_LRE_VUDS_MODE",
        "PLUGIN_LRE_TREND_REPORT",
        "PLUGIN_LRE_SEARCH_TIMESLOT",
        "PLUGIN_LRE_STATUS_BY_SLA",
        "PLUGIN_LRE_OUTPUT_DIR",
        "PLUGIN_LRE_WORKSPACE_DIR",
        "PLUGIN_LRE_ENABLE_STACKTRACE",
    ]
}

# -----------------------------
# Docker volume helper
# -----------------------------
def path_for_docker(p: str) -> str:
    """Convert path to Docker-friendly string (Linux/Windows)"""
    return str(Path(p).resolve())

# -----------------------------
# Run container
# -----------------------------
def run_test_container():
    print(f"Beginning running a test using container {image_name} ...")

    # Map volumes relative to current directory (works in GitHub Actions)
    volumes = [
        f"{path_for_docker('./harness/output')}:{env_vars['PLUGIN_LRE_OUTPUT_DIR']}",
        f"{path_for_docker('./harness/workspace')}:{env_vars['PLUGIN_LRE_WORKSPACE_DIR']}",
    ]

    # Build docker run command
    cmd = ["docker", "run", "--rm"]

    # Add volume mappings
    for vol in volumes:
        cmd += ["-v", vol]

    # Add environment variables
    for key, value in env_vars.items():
        if value:  # only pass if set
            cmd += ["-e", f"{key}={value}"]

    # Add image name
    cmd.append(image_name)

    # Run the docker command
    print("> Running Docker container...")
    subprocess.run(cmd, check=True)

    print(f"Finished running container {image_name}.")

# -----------------------------
# Main
# -----------------------------
if __name__ == "__main__":
    os.makedirs("./harness/output", exist_ok=True)
    os.makedirs("./harness/workspace", exist_ok=True)
    run_test_container()
