# from dotenv import load_dotenv
# load_dotenv()

# from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint

# llm = HuggingFaceEndpoint(
#     repo_id="openai/gpt-oss-120b",
#     task="text-generation",
#     max_new_tokens=512,
#     do_sample=False,
#     repetition_penalty=1.03,
#     provider="auto",  # let Hugging Face choose the best provider for you
# )

# chat_model = ChatHuggingFace(llm=llm)