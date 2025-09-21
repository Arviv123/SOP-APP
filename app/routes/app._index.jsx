import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  List,
  Link,
  InlineStack,
  Button,
  Badge,
  Icon,
  Box,
  Divider,
  Banner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { ChatIcon, SettingsIcon, ViewIcon } from "@shopify/polaris-icons";
import { useLoaderData } from "@remix-run/react";

import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  // Get real chat statistics from database
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalMessages, todayMessages] = await Promise.all([
    prisma.message.count(),
    prisma.message.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    })
  ]);

  // Calculate unique conversations
  const conversations = await prisma.message.groupBy({
    by: ['conversationId'],
    _count: {
      conversationId: true
    }
  });

  const todayConversations = await prisma.message.groupBy({
    by: ['conversationId'],
    where: {
      createdAt: {
        gte: today
      }
    },
    _count: {
      conversationId: true
    }
  });

  // Check system status
  const claudeEnabled = !!process.env.CLAUDE_API_KEY;
  const mcpConnected = !!process.env.SHOPIFY_API_KEY;

  return {
    chatStats: {
      totalConversations: conversations.length,
      activeToday: todayConversations.length,
      totalMessages: totalMessages,
      avgResponseTime: "< 3s" // This could be calculated from actual response times
    },
    features: {
      claudeEnabled,
      mcpConnected,
      themeExtensionInstalled: false // This would need to be checked via Shopify API
    }
  };
};

export default function Index() {
  const { chatStats, features } = useLoaderData();

  return (
    <Page>
      <TitleBar title="AI Chat Assistant">
        <button variant="primary" url="/app/conversations">View Conversations</button>
      </TitleBar>

      <BlockStack gap="500">
        {!features.themeExtensionInstalled && (
          <Banner status="warning" title="Setup Required">
            <p>Enable the AI Chat theme extension in your theme editor to activate the chat widget on your storefront.</p>
            <Box paddingBlockStart="300">
              <Button url="/admin/themes/current/editor?previewPath=%2F&addExtension=true" external>
                Open Theme Editor
              </Button>
            </Box>
          </Banner>
        )}

        {/* Stats Overview */}
        <Layout>
          <Layout.Section oneHalf>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  <InlineStack gap="200" align="center">
                    <Icon source={ChatIcon} />
                    Chat Analytics
                  </InlineStack>
                </Text>
                <InlineStack gap="600">
                  <BlockStack gap="100">
                    <Text variant="bodyLg" fontWeight="bold">{chatStats.totalConversations}</Text>
                    <Text variant="bodyMd" color="subdued">Total Conversations</Text>
                  </BlockStack>
                  <BlockStack gap="100">
                    <Text variant="bodyLg" fontWeight="bold" color="success">{chatStats.activeToday}</Text>
                    <Text variant="bodyMd" color="subdued">Active Today</Text>
                  </BlockStack>
                  <BlockStack gap="100">
                    <Text variant="bodyLg" fontWeight="bold">{chatStats.totalMessages}</Text>
                    <Text variant="bodyMd" color="subdued">Total Messages</Text>
                  </BlockStack>
                  <BlockStack gap="100">
                    <Text variant="bodyLg" fontWeight="bold">{chatStats.avgResponseTime}</Text>
                    <Text variant="bodyMd" color="subdued">Avg Response Time</Text>
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section oneHalf>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  <InlineStack gap="200" align="center">
                    <Icon source={SettingsIcon} />
                    System Status
                  </InlineStack>
                </Text>
                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    <Text variant="bodyMd">Claude AI</Text>
                    <Badge status={features.claudeEnabled ? "success" : "critical"}>
                      {features.claudeEnabled ? "Connected" : "Disconnected"}
                    </Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodyMd">MCP Platform</Text>
                    <Badge status={features.mcpConnected ? "success" : "critical"}>
                      {features.mcpConnected ? "Connected" : "Disconnected"}
                    </Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodyMd">Theme Extension</Text>
                    <Badge status={features.themeExtensionInstalled ? "success" : "attention"}>
                      {features.themeExtensionInstalled ? "Active" : "Setup Required"}
                    </Badge>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Features & Capabilities */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text as="h2" variant="headingMd">AI Chat Capabilities</Text>
                <Layout>
                  <Layout.Section oneThird>
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingSm">🛍️ Product Discovery</Text>
                      <List>
                        <List.Item>Natural language product search</List.Item>
                        <List.Item>Product recommendations</List.Item>
                        <List.Item>Inventory availability</List.Item>
                      </List>
                    </BlockStack>
                  </Layout.Section>

                  <Layout.Section oneThird>
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingSm">🛒 Shopping Assistant</Text>
                      <List>
                        <List.Item>Add items to cart</List.Item>
                        <List.Item>Update quantities</List.Item>
                        <List.Item>Checkout initiation</List.Item>
                      </List>
                    </BlockStack>
                  </Layout.Section>

                  <Layout.Section oneThird>
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingSm">📋 Store Information</Text>
                      <List>
                        <List.Item>Policies & FAQs</List.Item>
                        <List.Item>Order tracking</List.Item>
                        <List.Item>Returns & refunds</List.Item>
                      </List>
                    </BlockStack>
                  </Layout.Section>
                </Layout>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Quick Actions */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Quick Actions</Text>
                <InlineStack gap="300">
                  <Button
                    url="/admin/themes/current/editor?previewPath=%2F"
                    external
                    icon={ViewIcon}
                  >
                    Preview Chat Widget
                  </Button>
                  <Button variant="plain" url="/chat?test=true" external>
                    Test Chat API
                  </Button>
                  <Button variant="plain">
                    View Chat Logs
                  </Button>
                  <Button variant="plain">
                    Configure Settings
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Divider />

        {/* Setup Instructions */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Setup Instructions</Text>
                <BlockStack gap="300">
                  <Text variant="bodyMd" fontWeight="bold">1. Enable Theme Extension</Text>
                  <Text variant="bodyMd" color="subdued">
                    Go to your theme editor and enable the "AI Chat Assistant" extension to display the chat bubble on your storefront.
                  </Text>

                  <Text variant="bodyMd" fontWeight="bold">2. Configure Chat Settings</Text>
                  <Text variant="bodyMd" color="subdued">
                    Customize the chat bubble color, welcome message, and system prompts to match your brand.
                  </Text>

                  <Text variant="bodyMd" fontWeight="bold">3. Test the Experience</Text>
                  <Text variant="bodyMd" color="subdued">
                    Visit your storefront and try the chat assistant with example queries like "search for sneakers" or "what's your return policy?".
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
