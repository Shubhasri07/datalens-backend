from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-6-luna",
    input="Hello! Say hello to me."
)

print(response.output_text)