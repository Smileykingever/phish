import pickle
import pandas as pd
from enum import Enum
from typing import Tuple, List, Dict
from model_training.features import extract_features


class PhishRes(Enum):
    Legit = 0,
    Phishing = 1


Features = List[Tuple[str, bool]]


class phishDetect:
    def __init__(self, url: str):
        # info : https://phishtank.org/phish_detail.php?phish_id=8043169
        self.url = url
        self.ft_title = [
            "IP",
            "Len",
            "Multiple //",
            "Symbols",
            "https",
            "history",
            "iframe",
            "mouseover",
            "domainAge",
        ]
        self.features = extract_features(self.url)
        self.df = pd.DataFrame(data=[self.features], columns=self.ft_title)

    def get_res(self) -> PhishRes:
        with open("mlp_model.pkl", "rb") as mod_file:
            model = pickle.load(mod_file)
        out = model.predict(self.df)
        return PhishRes(out)

    def get_features(self) -> Features:
        return list(
            map(lambda x: (x[0], x[1][0]), self.df.to_dict().items()))
