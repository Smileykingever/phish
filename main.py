from phishDetect import PhishRes, phishDetect, Features
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from enum import Enum
from fastapi import Query
import psycopg2
from psycopg2 import Error
import urllib.parse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PhisherInput(BaseModel):
    url: str


class PhisherRespose(BaseModel):
    res: PhishRes
    features: Features

class ReportInput(BaseModel):
    reportUrl: str

class URLType(str, Enum):
    FAKE = "fake"
    REAL = "real"

@app.post("/check_url")
async def check_url(input: PhisherInput, response_model=PhisherRespose):
    url: str = input.url
    pd = phishDetect(url)
    res = pd.get_res()
    features = pd.get_features()
    return {"res": res, "features": features}

@app.post("/add_url")
async def add_url(input: ReportInput, type: URLType = Query(..., description="Type of URL: 'fake' or 'real'")):
    url: str = input.reportUrl

    try:
        #Extract the hostname from the URL
        parsed_url = urllib.parse.urlparse(url)
        host = parsed_url.hostname

        connection = psycopg2.connect(
            user="postgres",
            password="<password>",
            host="127.0.0.1",
            port="5432",
            database="postgres"
        )

        cursor = connection.cursor()

        #Check if host exists
        select_query = "SELECT host FROM manualcheck WHERE host = %s"
        cursor.execute(select_query, (host,))
        result = cursor.fetchone()

        if not result:
           #if not insert in the table
            if type == URLType.FAKE:
                insert_query = "INSERT INTO manualcheck (host, url, fake) VALUES (%s, %s, 'True')"
            elif type == URLType.REAL:
                insert_query = "INSERT INTO manualcheck (host, url, fake) VALUES (%s, %s, 'False')"

            cursor.execute(insert_query, (host, url))

        connection.commit()

        cursor.close()
        connection.close()

        return {"message": "URL added successfully"}

    except (Exception, Error) as error:
        return {"message": f"Error adding URL: {error}"}