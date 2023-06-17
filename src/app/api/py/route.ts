import { exec } from "child_process";
import { writeFileSync } from "fs";
// import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  console.log(req); // Add this line

  const pythonScript = `import seaborn as sns
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
                  `;

  writeFileSync("temp.py", pythonScript);

  try {
    exec("pip3 install seaborn matplotlib pandas", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return NextResponse.json({
          message: `Python script execution failed: ${error}`,
        });
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });

    const base64String = await new Promise((resolve, reject) => {
      exec("python3 temp.py", (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          reject(error);
          return;
        }
        resolve(stdout.trim()); // The stdout will contain your base64 string
      });
    });

    // Send the base64 string to the frontend
    return NextResponse.json({ base64String });
  } catch (error) {
    return NextResponse.json({
      message: `Python script execution failed: ${error}`,
    });
  }
}
