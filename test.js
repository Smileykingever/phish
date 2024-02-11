import { FormEvent, useState } from "react";
import {
    Button,
    Container,
    CircularProgress,
    TextField,
    Typography,
} from "@mui/material";
import logo from "/images/logo.png";

interface PhishRes {
    res: number;
    features: Array<[string, number]>;
    // ["IP", number],
    // ["Len", number],
    // ["Multiple //", number],
    // ["Symbols", number],
    // ["https", number],
    // ["history", number],
    // ["iframe", number],
    // ["mouseover", number],
    // ["domainAge", number]
}

function App() {
    const [url, setUrl] = useState("");
    const [reportUrl, setReportUrl] = useState("");
    const [reportType, setReportType] = useState("");

    const [result, setResult] = useState<PhishRes>();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({ url });

        const requestOptions: RequestInit = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/check_url",
                requestOptions
            );
            const result = await response.text();
            const res = JSON.parse(result) as PhishRes;
            console.log("Res : ", res);
            setResult(res);
        } catch (error) {
            console.log("error", error);
        } finally {
            setIsLoading(false);
        }
    };

    const manualCheck = async () => {
        setIsLoading(true);

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({ reportUrl });

        const requestOptions: RequestInit = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };
        try {
            const response = await fetch(
                "http://127.0.0.1:8000/add_url?type=" + reportType,
                requestOptions
            );
            if (response.ok) {
                console.log('URL added successfully');
            } else {
                console.log('Error:', response.status);
            }
        } catch (error) {
            console.log("error", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container
            maxWidth="sm"
            style={{
                textAlign: "center",
                marginTop: 50,
                backgroundColor: "#ffffff",
            }}
        >
            <img
                src={logo}
                alt="Logo"
                style={{ height: 50, marginBottom: 20 }}
            />{" "}
            <form onSubmit={handleSubmit} style={{}}>
                <Typography variant="h4" gutterBottom>
                    Check if a website is Phishing or not
                </Typography>
                <TextField
                    label="Enter URL"
                    fullWidth
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    style={{ marginBottom: 20 }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress size={24} /> : "Submit"}
                </Button>
            </form>
            {result && (
                <Typography
                    variant="h6"
                    style={{
                        marginTop: 20,
                        color: result.res === 1 ? "red" : "green",
                    }}
                >
                    {result.res === 1
                        ? "Phishing website detected"
                        : "The website is real"}
                </Typography>
            )}
            <form style={{ marginTop: 30 }}>
                <Typography variant="h5" gutterBottom>
                    Report ThePhish
                </Typography>
                <TextField
                    label="Enter URL"
                    fullWidth
                    value={reportUrl}
                    onChange={(e) => setReportUrl(e.target.value)}
                    style={{ marginBottom: 20 }}
                />
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "10px",
                    }}
                >
                    <div style={{ display: "flex", gap: "20px" }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                setReportType("fake");
                                manualCheck();
                            }}
                            disabled={isLoading}
                        >
                            Fake
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                setReportType("real");
                                manualCheck();
                            }}
                            disabled={isLoading}
                        >
                            Real
                        </Button>
                    </div>
                </div>
            </form>
        </Container>
    );
}

export default App;
