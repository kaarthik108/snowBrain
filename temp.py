import seaborn as sns
import matplotlib.pyplot as plt
import base64
from io import BytesIO

# Load an example dataset
tips = sns.load_dataset("tips")

# Create a plot
sns.relplot(x="total_bill", y="tip", col="time",
            hue="smoker", style="smoker", size="size",
            data=tips)

# Save the plot to a BytesIO object
buf = BytesIO()
plt.savefig(buf, format='png')
buf.seek(0)

# Convert plot to a base64 string
plot_string = base64.b64encode(buf.read()).decode()

print(plot_string)
