import os
import json
import logging
from typing import List, Dict, Optional, Any
from pathlib import Path

logger = logging.getLogger(__name__)

class ModelVersionManager:
    """
    Manages multiple AI model versions.
    Scans a models directory for available models, tracks metadata,
    and allows switching the active model.
    """

    def __init__(self, models_dir: str = "./models", active_model_file: str = "./active_model.json"):
        self.models_dir = Path(models_dir)
        self.active_model_file = Path(active_model_file)
        self.models: Dict[str, Dict[str, Any]] = {}
        self.active_model: Optional[str] = None
        self._load_active_model()
        self.scan_models()

    def _load_active_model(self):
        """Load the name of the active model from a JSON file."""
        if self.active_model_file.exists():
            try:
                with open(self.active_model_file, 'r') as f:
                    data = json.load(f)
                    self.active_model = data.get('active_model')
            except Exception as e:
                logger.error(f"Failed to load active model: {e}")

    def _save_active_model(self):
        """Save the active model name to a JSON file."""
        try:
            with open(self.active_model_file, 'w') as f:
                json.dump({'active_model': self.active_model}, f)
        except Exception as e:
            logger.error(f"Failed to save active model: {e}")

    def scan_models(self) -> Dict[str, Dict[str, Any]]:
        """
        Scan the models directory for available models.
        Recognizes model files (.gguf, .bin, .pt, .pth, .safetensors)
        and reads metadata from a metadata.json file if present in the same folder.
        Returns a dictionary mapping model names to metadata.
        """
        self.models.clear()
        if not self.models_dir.exists():
            logger.warning(f"Models directory {self.models_dir} does not exist")
            return self.models

        # Iterate over files and subdirectories
        for item in self.models_dir.iterdir():
            if item.is_file():
                # Single model file at root
                if item.suffix.lower() in ['.gguf', '.bin', '.pt', '.pth', '.safetensors']:
                    model_name = item.stem
                    self.models[model_name] = {
                        'name': model_name,
                        'path': str(item),
                        'size': item.stat().st_size,
                        'type': 'file',
                        'metadata': self._read_metadata(item.parent / f"{model_name}.json"),
                    }
            elif item.is_dir():
                # Folder may contain model files and metadata.json
                # Look for any model file inside
                model_files = list(item.glob("*.gguf")) + list(item.glob("*.bin")) + \
                              list(item.glob("*.pt")) + list(item.glob("*.pth")) + \
                              list(item.glob("*.safetensors"))
                if model_files:
                    # Use the largest file as the primary model (or first)
                    model_file = max(model_files, key=lambda f: f.stat().st_size)
                    model_name = item.name
                    self.models[model_name] = {
                        'name': model_name,
                        'path': str(model_file),
                        'size': model_file.stat().st_size,
                        'type': 'folder',
                        'metadata': self._read_metadata(item / "metadata.json"),
                    }
                else:
                    # No model file, maybe it's a nested structure; ignore for now
                    pass

        logger.info(f"Scanned models: {list(self.models.keys())}")
        return self.models

    def _read_metadata(self, path: Path) -> Dict[str, Any]:
        """Read metadata from a JSON file, return empty dict if not found."""
        if path.exists():
            try:
                with open(path, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to read metadata {path}: {e}")
        return {}

    def list_models(self) -> List[Dict[str, Any]]:
        """Return a list of all available models with their metadata."""
        return list(self.models.values())

    def get_model_info(self, name: str) -> Optional[Dict[str, Any]]:
        """Get info for a specific model by name."""
        return self.models.get(name)

    def set_active_model(self, name: str) -> bool:
        """Set the active model by name."""
        if name not in self.models:
            logger.error(f"Model {name} not found")
            return False
        self.active_model = name
        self._save_active_model()
        logger.info(f"Active model set to {name}")
        return True

    def get_active_model(self) -> Optional[Dict[str, Any]]:
        """Get info for the currently active model."""
        if self.active_model:
            return self.models.get(self.active_model)
        return None

    def get_model_path(self, name: Optional[str] = None) -> Optional[str]:
        """Get the filesystem path of a model. If name is None, return active model's path."""
        if name is None:
            name = self.active_model
        if name and name in self.models:
            return self.models[name]['path']
        return None

    def get_model_metadata(self, name: Optional[str] = None) -> Dict[str, Any]:
        """Get metadata for a model. If name is None, return active model's metadata."""
        if name is None:
            name = self.active_model
        if name and name in self.models:
            return self.models[name].get('metadata', {})
        return {}
