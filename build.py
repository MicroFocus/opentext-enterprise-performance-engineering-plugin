import subprocess
import shutil
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# -----------------------------
# Configurable image metadata
# -----------------------------
IMAGE_BASE = "lre-harness-node-java-app"
IMAGE_VERSION = "1.0"
IMAGE_NAME = f"{IMAGE_BASE}:{IMAGE_VERSION}"

JAVA_APP_DIR = Path("java-app")
NODE_APP_DIR = Path("nodejs-app")


def run(cmd, cwd=None):
    """Run shell command and raise on failure"""
    print(f"> {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    result = subprocess.run(cmd, cwd=cwd, shell=True)
    if result.returncode != 0:
        raise RuntimeError(f"Command failed: {cmd}")


def build_java():
    """Build Java project with Maven"""
    print("=== Building Java project ===")
    target_dir = JAVA_APP_DIR / "target"
    if target_dir.exists():
        shutil.rmtree(target_dir)

    # Pre-fetch dependencies
    run(["mvn", "dependency:go-offline"], cwd=JAVA_APP_DIR)
    # Build JAR
    run(["mvn", "clean", "package", "-DskipTests"], cwd=JAVA_APP_DIR)
    print("=== Java build completed ===")


def build_node():
    """Build Node.js / TypeScript project"""
    print("=== Building Node.js project ===")
    dist_dir = NODE_APP_DIR / "dist"
    if dist_dir.exists():
        shutil.rmtree(dist_dir)

    run(["npm", "install"], cwd=NODE_APP_DIR)
    run(["npx", "tsc"], cwd=NODE_APP_DIR)
    print("=== Node.js build completed ===")


def build_docker():
    """Build Docker image"""
    print(f"=== Building Docker image: {IMAGE_NAME} ===")
    # Remove old image if exists
    run(f"docker image rm -f {IMAGE_NAME} || true")
    # Build new image
    run(f"docker build -t {IMAGE_NAME} .")
    print("=== Docker image build completed ===")


if __name__ == "__main__":
    print("=== Starting parallel builds ===")
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = {
            executor.submit(build_java): "Java",
            executor.submit(build_node): "Node.js",
        }

        for future in as_completed(futures):
            project = futures[future]
            try:
                future.result()
            except Exception as e:
                print(f"Error building {project}: {e}")
                exit(1)

    print("=== All builds finished, building Docker image ===")
    build_docker()
