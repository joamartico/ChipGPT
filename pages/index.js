import { useRef, useState } from "react";
import styled from "styled-components";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const API_URL = "https://api.openai.com/v1/chat/completions";

export default function Home() {
	const [promptValue, setPromptValue] = useState("");
	const [messages, setMessages] = useState([]);
	const [isTyping, setIsTyping] = useState(false);
	const textAreaRef = useRef();
	const scrollRef = useRef();

	const handleChange = (event) => {
		setPromptValue(event.target.value);
		if (event.target.scrollHeight > 50) {
			event.target.style.height = "auto";
			event.target.style.height = event.target.scrollHeight + "px";
		}
	};

	async function askToGpt() {
		setPromptValue("");
		textAreaRef.current.style.height = "0px";
		textAreaRef.current.blur();
		setIsTyping(true);
		const newMessages = [
			{
				role: "system",
				content:
					"You are an electronics component assistant called ChipGPT. You help the user find the perfect component to his project.",
			},
			...messages,
			{ role: "user", content: promptValue },
		];
		await setMessages(newMessages);
		scrollRef.current.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: "smooth",
		});
		const response = await fetch(API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${API_KEY}`,
			},
			body: JSON.stringify({
				model: "gpt-3.5-turbo",
				messages: newMessages,
				// stream: true,
				temperature: 0.5,
				stop: ["\ninfo:"],
			}),
		});

		const data = await response.json();
		const newMessages2 = [...newMessages, data.choices[0].message];
		setIsTyping(false);
		setMessages(newMessages2);
		scrollRef.current.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: "smooth",
		});
	}

	return (
		<>
			<ion-content fullscreen>
				<Container>
					<Title>ChipGPT</Title>

					<Scroll ref={scrollRef}>
						{messages?.map(
							(message) =>
								message.content &&
								message.role != "system" && (
									<Message role={message.role}>
										{message.content}
									</Message>
								)
						)}
						{isTyping && (
							<Message role="assistant" typing>
								...
							</Message>
						)}
					</Scroll>

					<Form
						onSubmit={(e) => {
							e.preventDefault();
							askToGpt();
						}}
					>
						<TextArea
							value={promptValue}
							onChange={handleChange}
							placeholder="Type something..."
							onKeyPress={(event) => {
								if (event.key === "Enter") {
									askToGpt();
								}
							}}
							ref={textAreaRef}
						/>

						<Button>
							<ion-icon size={30} name="paper-plane" />
						</Button>
					</Form>
				</Container>
			</ion-content>
		</>
	);
}
const Container = styled.div`
	margin: auto;
	width: 100%;
	max-width: 700px;
	height: 100%;
	display: flex;
	flex-direction: column;
	font-size: 16px;
	line-height: 30px;
	overflow: hidden !important;
`;

const Scroll = styled.div`
	height: 100%;
	max-height: 100%;
	width: 100%;
	overflow-y: scroll;
`;

const Title = styled.h1`
	font-size: 2rem;
	font-family: "Montserrat", "Open Sans", sans-serif;
	font-weight: bold;
	color: darkorange;
	text-align: left;
	margin-bottom: 15px;
	margin-left: 20px;
	margin-bottom: 30px;
`;

const Message = styled.div`
	max-width: 80%;
	width: fit-content;
	background: #cef;
	border-radius: 10px;
	padding: 5px 15px;
	margin: ${(props) =>
		props.role == "user" ? "0 20px 0 auto" : "0 auto 0 20px"};
	margin-bottom: 20px;
	background: ${(props) => (props.role == "user" ? "#cef" : "#ddd")};
	/* border-radius: ${(props) =>
		props.role == "user" ? "10px 10px 0 10px" : "10px 10px 10px 0"}; */
	color: ${(props) => (props.typing ? "#999" : "")};
`;

const Form = styled.form`
	width: 100%;
	display: flex;
	padding: 10px 20px;
	padding-top: 15px;
	margin-bottom: 12%;
	height: 20px;
	padding-bottom: 40px;
	pointer-events: auto !important;
	z-index: 999999;
	box-shadow: 0px -5px 10px 0px rgba(0, 0, 0, 0.1);
`;

const TextArea = styled.textarea`
	width: 100%;
	min-height: 42px;
	padding: 5px;
	padding-left: 12px;
	@media screen and (min-width: 700px) {
		min-height: 50px;
		padding: 10px;
		padding-left: 15px;
	}
	font-size: 16px;
	border: none;
	border-radius: 10px;
	background-color: #f2f2f2;
	resize: none;
	&:focus {
		outline: none;
	}
	margin-right: 10px;
`;

const Button = styled.button`
	background-color: darkorange;
	flex-shrink: 0;
	color: #333;
	border: none;
	border-radius: 10px;
	font-size: 16px;
	font-weight: bold;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 !important;
	text-align: center;
	width: 42px;
	height: 42px;
	@media screen and (min-width: 700px) {
		height: 50px;
		width: 50px;
		padding: 10px;
		padding-left: 15px;
	}
	&:active {
		opacity: 0.5;
	}
`;
