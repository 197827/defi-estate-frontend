import type { Meta, StoryObj } from "@storybook/react";

import { Card } from "./Card";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Card className="w-80 p-6">A simple card surface.</Card>,
};

export const WithContent: Story = {
  render: () => (
    <Card className="w-80 p-6">
      <h2 className="text-lg font-semibold text-foreground">Card title</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This card demonstrates the surface, border, and rounded tokens applied
        to a piece of sample content.
      </p>
    </Card>
  ),
};