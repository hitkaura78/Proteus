# Proteus — System Architecture Overview

## Core Concept

Proteus is an adaptive intrusion detection system (IDS) for Software-Defined Networks (SDN) that responds to evolving network attack patterns rather than relying on a fixed, pre-trained model. A classifier monitors network traffic while a drift detection mechanism tracks statistically significant changes in its prediction confidence. When drift is identified, a conditional Wasserstein Generative Adversarial Network with Gradient Penalty (WGAN-GP) generates synthetic samples representing rare or emerging attack patterns. These samples are evaluated by a Maximum Mean Discrepancy (MMD) fidelity gate against recent real traffic before being accepted into the training dataset. The classifier then retrains and redeploys using a bounded data buffer. Proteus's main contribution is the integration of drift detection, fidelity-checked synthetic data, adaptive retraining, and model deployment into a unified workflow, rather than the introduction of an entirely new individual algorithm.

## Two Parallel Backends

### 1. Demonstration Backend

The demonstration backend, implemented through `proteus/data.py`, `baseline.py`, `gan.py`, `drift.py`, `fidelity.py`, `stream.py`, `pipeline.py`, and `app.py`, provides a lightweight proof of concept designed to execute on a laptop CPU within minutes. It uses the NSL-KDD dataset when available and otherwise generates synthetic data following the same schema, clearly identifying the fallback in the interface. Its compact WGAN-GP model uses two hidden layers and approximately 300 training steps. The Streamlit interface provides an architecture diagram, performance metrics, a pipeline execution button, and an interactive drift-detection demonstration. This backend is maintained as a stable demonstration build.

### 2. Full-Scale Backend

The full-scale backend is intended for more rigorous experimentation and ongoing development. It uses verified real datasets, GPU-based GAN training, and stricter evaluation procedures without silently substituting synthetic data when a dataset cannot be obtained.

- **Data processing (`data_full.py`):** Combines CICIDS2017, using the corrected WTMC-2021 variant, and InSDN into a common feature schema. The documented CICIDS2017 dataset contains 2,100,021 cleaned records across 25 classes and 80 features. InSDN contains 343,889 records across 8 classes, also represented by 80 features. Both datasets use stratified 70/15/15 training, validation, and testing splits.

- **GAN training (`gan_full.py`):** Implements a conditional WGAN-GP with three-layer generator and critic networks. Layer Normalization is used in the critic. Synthetic-data targets are selected according to documented rarity and modelability criteria; classes with insufficient examples are excluded rather than artificially fabricated. Training uses a generator-loss plateau criterion, saves recent checkpoints, and produces per-class diversity and mode-collapse diagnostics against held-out real validation data. GPU execution is required.

- **Closed-loop adaptation (`closed_loop_full.py`):** The `ClosedLoopOrchestrator` responds to drift detected by the KS test, resumes GAN training on recent data, and sends generated batches through the MMD fidelity gate. Accepted synthetic samples and recent real records are then incorporated into the `BoundedBufferClassifier`. Its storage is limited to a 20,000-row reference reservoir and a 5,000-row sliding recent-data buffer, keeping adaptation storage bounded as the traffic stream grows. A fixed 30% portion of each incoming window is held out from adaptation to measure performance on unseen records and prevent evaluation leakage.

- **Evaluation (`evaluate_full.py`):** Compares baseline classification, static augmentation, and closed-loop adaptation using the same temporal-drift schedule based on real data. The documented single-seed result reports a final Macro-F1 of 0.1738 for the closed-loop approach, compared with 0.0294 for the baseline. However, the planned five-seed evaluation and 95% confidence intervals have not yet been completed.

## SDN Controller Integration

The SDN component uses Ryu 4.34 as its controller framework, running in a dedicated Python 3.8 virtual environment to accommodate its legacy dependencies. A setup script documents the verified dependency configuration. However, Mininet is not yet installed in the documented environment, so the initial topology and controller-connectivity test remains blocked. Consequently, full-scale integration of the adaptive pipeline with a live Mininet/Ryu deployment has not yet been completed.

## Frontend and Dashboard Architecture

Proteus provides two separate user interfaces:

- **Streamlit demonstration (`app.py`):** Presents the lightweight proof of concept and its interactive pipeline and drift-detection features.
- **Next.js mission-control dashboard (`frontend/` and `api/`):** Provides a separate security-operations-style interface containing Overview, Live Detection, Topology, Drift Monitor, Synthetic Lab, Fidelity Gate, Adaptation, Experiments, Audit Log, and Models screens. It uses Next.js 16, TypeScript, Tailwind CSS v4, and Recharts. A read-only FastAPI service supplies existing demonstration results and precomputed dataset summaries. Metrics that are not yet computed are explicitly marked as unavailable instead of being fabricated.

The API can be started from the repository root with `uvicorn api.server:app --port 8000`, while the frontend can be launched from the `frontend` directory using `npm run dev`.

## CPU Resource Management

The `proteus/config.py` module controls numerical-library thread usage by configuring environment variables before importing computational libraries such as NumPy, PyTorch, pandas, and scikit-learn. It also exposes a default job limit for Random Forest and similar operations. Correct import ordering prevents excessive nested parallelism, which previously caused CPU spikes and throttling. New computational modules must follow the same import-order convention to ensure these limits take effect.

## Software Environments

Proteus maintains separate environments for its different components:

- **Main `.venv`:** Python 3.12 environment for data processing, machine learning, the API, and other backend dependencies. PyTorch must use a CUDA-enabled build for GPU training.
- **`.venv-ryu`:** Dedicated Python 3.8 environment for the Ryu controller.
- **`frontend/node_modules`:** Dependencies for the Next.js dashboard.

The project follows an additive dependency-installation policy to avoid disrupting the shared environment.

## Dataset Provenance

The project documents the use of datasets obtained from their original institutional sources rather than relying on third-party re-uploads. CICIDS2017 uses the corrected version associated with the DistriNet Research Group at KU Leuven, while InSDN is sourced from the UCD ASEADOS Lab at University College Dublin. The dataset manifest records source URLs, hashes, and retrieval dates to support reproducibility.
