import { useRef, useState } from "react";
import styled from "styled-components";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const API_URL = "https://api.openai.com/v1/chat/completions";
const cx = "c194a50057af541b6";

const fetchImage = (query) => {
	return fetch(
		`https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${cx}&q=${query}&searchType=image`
	)
		.then((response) => response.json())
		.then((_data) => {
			const imageUrl = _data.items[0].link;
			return imageUrl;
		});
};

export default function Home() {
	const [promptValue, setPromptValue] = useState("");
	const [messages, setMessages] = useState([
		{
			role: "system",
			content:
				"You are an electronics component assistant called ZENREAL. You help the user find the perfect component to his project. Finish your message with: // <COMPONENT-NAME>.",
		},
		{
			role: "assistant",
			content:
				"Hello! How can I assist you today in finding the perfect electronics component for your project?",
		},
	]);
	const [isTyping, setIsTyping] = useState(false);
	const [images, setImages] = useState([""]);
	const textAreaRef = useRef();
	const scrollRef = useRef();

	const handleChange = (event) => {
		setPromptValue(event.target.value);
		if (event.target.scrollHeight > 50) {
			event.target.style.height = "auto";
			event.target.style.height = event.target.scrollHeight + "px";
		}
		console.log(images);
		console.log(messages);
	};

	async function askToGpt() {
		setPromptValue("");
		textAreaRef.current.style.height = "0px";
		textAreaRef.current.blur();
		setIsTyping(true);
		const newMessages = [
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
				Authorization: `Bearer ${OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				model: "gpt-3.5-turbo",
				messages: newMessages,
				// stream: true,
				temperature: 0.0,
				stop: ["\ninfo:"],
			}),
		});

		const data = await response.json();
		console.log(data);
		const newMessages2 = [...newMessages, data.choices[0].message];
		setIsTyping(false);
		setMessages(newMessages2);
		scrollRef.current.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: "smooth",
		});

		const componentsName = data.choices[0]?.message.content.split("//")[1];
		const queries = componentsName?.split(" or ");
		const promises = queries.map((query) => fetchImage(query));
		const newImgs = await Promise.all(promises);
		setImages((prev) => [...prev, "", newImgs]);

		scrollRef.current.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: "smooth",
		});
	}

	return (
		<>
			<ion-content fullscreen>
				<PCB>
					<Title>ZENREAL</Title>

					<Scroll ref={scrollRef}>
						{messages?.map(
							(message, i) =>
								message.content &&
								message.role != "system" && (
									<>
										<Message role={message.role}>
											{message.content}
										</Message>

										{images[i - 1] &&
											images[i - 1].map((image) => (
												<Message
													role={message.role}
													style={{ marginTop: -12 }}
												>
													<Img src={image} />
												</Message>
											))}
									</>
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
				</PCB>
			</ion-content>
		</>
	);
}
const PCB = styled.div`
	background: radial-gradient(
		ellipse at center,
		#238b26 20%,
		#3eb73f 100%
	); /* green radial background gradient */
	margin: auto;
	width: 100%;
	max-width: 700px;
	height: 100%;
	display: flex;
	flex-direction: column;
	font-size: 16px;
	line-height: 30px;
	overflow: visible !important;
	box-shadow: -0px 4px 30px rgba(0, 0, 0, 0.5) !important; /* shadow */
	border-radius: 10px;

	@media screen and (min-width: 1000px) {
		width: 450px;
		height: 90% !important;
		margin: auto !important;
		transform: translateY(5%);
	}
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
	color: #ffe99b;
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
		props.role == "user" ? "0 20px 20px auto" : "0 auto 20px 20px"};
	background: ${(props) => (props.role == "user" ? "#cef" : "#ddd")};
	/* border-radius: ${(props) =>
		props.role == "user" ? "10px 10px 0 10px" : "10px 10px 10px 0"}; */
	color: ${(props) => (props.typing ? "#999" : "")};
`;

const Img = styled.img`
	border-radius: 10px;
	max-width: 70%;
	margin: 15px auto;
	justify-content: center;
	align-items: center;
	justify-self: center;
	display: flex;
`;

const Form = styled.form`
	background: none;
	/* background: #145D40; */
	/* box-shadow: 0px -5px 10px 0px rgba(0, 0, 0, 0.2); */
	width: 100%;
	display: flex;
	padding: 10px 20px;
	padding-top: 15px;
	padding-bottom: calc(15% + env(safe-area-inset-bottom));
	height: 20px;
	pointer-events: auto !important;
	z-index: 999999;
	/* border-top: 5px solid #238B26; */
	border-top: 2px solid #ffe99b;
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
	flex-shrink: 0;
	/* background: #ffe99b; */
	/* color: #2D322F; */
	background: #2d322f;
	color: white;
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
