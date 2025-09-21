import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
  Button,
  Badge,
  DataTable,
  TextField,
  Select,
  Pagination,
  Box,
  Modal,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useLoaderData, useSearchParams, Form } from "@remix-run/react";
import { useState, useCallback } from "react";

export const loader = async ({ request }) => {
  // In a real app, this would fetch from your database
  const conversations = [
    {
      id: "conv_001",
      customerName: "John Doe",
      lastMessage: "Thanks for helping me find those sneakers!",
      status: "completed",
      startTime: "2024-01-15 14:30",
      messageCount: 8,
      satisfaction: "positive"
    },
    {
      id: "conv_002",
      customerName: "Sarah Wilson",
      lastMessage: "Can you help me track my order?",
      status: "active",
      startTime: "2024-01-15 16:45",
      messageCount: 3,
      satisfaction: null
    },
    {
      id: "conv_003",
      customerName: "Mike Johnson",
      lastMessage: "What's your return policy?",
      status: "completed",
      startTime: "2024-01-15 12:15",
      messageCount: 5,
      satisfaction: "positive"
    },
    {
      id: "conv_004",
      customerName: "Emma Brown",
      lastMessage: "I need help with sizing",
      status: "needs_attention",
      startTime: "2024-01-15 17:20",
      messageCount: 12,
      satisfaction: "negative"
    }
  ];

  return {
    conversations,
    totalCount: conversations.length,
    filters: {
      status: ["all", "active", "completed", "needs_attention"],
      satisfaction: ["all", "positive", "negative", "neutral"]
    }
  };
};

export default function Conversations() {
  const { conversations, totalCount, filters } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [modalActive, setModalActive] = useState(false);

  const statusOptions = filters.status.map(status => ({
    label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    value: status
  }));

  const satisfactionOptions = filters.satisfaction.map(satisfaction => ({
    label: satisfaction.charAt(0).toUpperCase() + satisfaction.slice(1),
    value: satisfaction
  }));

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { status: "info", label: "Active" },
      completed: { status: "success", label: "Completed" },
      needs_attention: { status: "critical", label: "Needs Attention" }
    };
    const config = statusMap[status] || { status: "default", label: status };
    return <Badge status={config.status}>{config.label}</Badge>;
  };

  const getSatisfactionBadge = (satisfaction) => {
    if (!satisfaction) return <Text color="subdued">-</Text>;
    const satisfactionMap = {
      positive: { status: "success", label: "😊 Positive" },
      negative: { status: "critical", label: "😞 Negative" },
      neutral: { status: "info", label: "😐 Neutral" }
    };
    const config = satisfactionMap[satisfaction];
    return <Badge status={config.status}>{config.label}</Badge>;
  };

  const handleConversationClick = useCallback((conversation) => {
    setSelectedConversation(conversation);
    setModalActive(true);
  }, []);

  const rows = conversations.map((conversation) => [
    <Button variant="plain" onClick={() => handleConversationClick(conversation)}>
      {conversation.id}
    </Button>,
    conversation.customerName,
    conversation.lastMessage.length > 50
      ? conversation.lastMessage.substring(0, 50) + "..."
      : conversation.lastMessage,
    getStatusBadge(conversation.status),
    getSatisfactionBadge(conversation.satisfaction),
    conversation.messageCount,
    conversation.startTime,
  ]);

  const mockConversationHistory = selectedConversation ? [
    { role: "customer", message: "Hi, I'm looking for running shoes", time: "14:30" },
    { role: "assistant", message: "I'd be happy to help you find running shoes! What type of running do you do most often?", time: "14:30" },
    { role: "customer", message: "Mostly road running, about 5K distances", time: "14:31" },
    { role: "assistant", message: "Perfect! For 5K road running, I'd recommend checking out our Nike Air Zoom Pegasus or Adidas Ultraboost series. Would you like me to show you some options?", time: "14:31" },
    { role: "customer", message: "Yes please, what sizes do you have?", time: "14:32" },
    { role: "assistant", message: "I'll search our current inventory for you. What's your shoe size?", time: "14:32" },
    { role: "customer", message: "Size 10", time: "14:33" },
    { role: "assistant", message: "Great! I found several options in size 10. Would you like me to add any to your cart?", time: "14:35" },
  ] : [];

  return (
    <Page>
      <TitleBar title="Chat Conversations">
        <button variant="primary">Export Data</button>
      </TitleBar>

      <BlockStack gap="500">
        {/* Filters */}
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">Filters</Text>
            <InlineStack gap="400">
              <Box minWidth="200px">
                <TextField
                  label="Search conversations"
                  placeholder="Search by customer name or message..."
                  autoComplete="off"
                />
              </Box>
              <Box minWidth="150px">
                <Select
                  label="Status"
                  options={statusOptions}
                  value={searchParams.get("status") || "all"}
                  onChange={(value) => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set("status", value);
                    setSearchParams(newParams);
                  }}
                />
              </Box>
              <Box minWidth="150px">
                <Select
                  label="Satisfaction"
                  options={satisfactionOptions}
                  value={searchParams.get("satisfaction") || "all"}
                  onChange={(value) => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set("satisfaction", value);
                    setSearchParams(newParams);
                  }}
                />
              </Box>
            </InlineStack>
          </BlockStack>
        </Card>

        {/* Conversations Table */}
        <Card>
          <DataTable
            columnContentTypes={[
              'text',
              'text',
              'text',
              'text',
              'text',
              'numeric',
              'text',
            ]}
            headings={[
              'Conversation ID',
              'Customer',
              'Last Message',
              'Status',
              'Satisfaction',
              'Messages',
              'Started',
            ]}
            rows={rows}
            footerContent={`Showing ${conversations.length} of ${totalCount} conversations`}
          />
        </Card>

        {/* Pagination */}
        <InlineStack align="center">
          <Pagination
            label="Conversations"
            hasPrevious
            onPrevious={() => {}}
            hasNext
            onNext={() => {}}
          />
        </InlineStack>
      </BlockStack>

      {/* Conversation Detail Modal */}
      <Modal
        open={modalActive}
        onClose={() => setModalActive(false)}
        title={`Conversation ${selectedConversation?.id}`}
        large
      >
        <Modal.Section>
          {selectedConversation && (
            <BlockStack gap="400">
              <InlineStack gap="400">
                <Text variant="bodyMd" fontWeight="bold">Customer:</Text>
                <Text variant="bodyMd">{selectedConversation.customerName}</Text>
                <Text variant="bodyMd" fontWeight="bold">Status:</Text>
                {getStatusBadge(selectedConversation.status)}
                <Text variant="bodyMd" fontWeight="bold">Messages:</Text>
                <Text variant="bodyMd">{selectedConversation.messageCount}</Text>
              </InlineStack>

              <Box background="bg-surface-secondary" padding="400" borderRadius="200">
                <Text variant="headingSm" marginBlockEnd="300">Conversation History</Text>
                <Box style={{maxHeight: "400px", overflow: "auto"}}>
                  <BlockStack gap="300">
                    {mockConversationHistory.map((msg, index) => (
                      <Box
                        key={index}
                        padding="300"
                        background={msg.role === "customer" ? "bg-fill-brand-secondary" : "bg-fill-secondary"}
                        borderRadius="150"
                      >
                        <BlockStack gap="100">
                          <InlineStack align="space-between">
                            <Text variant="bodySm" fontWeight="bold">
                              {msg.role === "customer" ? "Customer" : "AI Assistant"}
                            </Text>
                            <Text variant="bodySm" color="subdued">{msg.time}</Text>
                          </InlineStack>
                          <Text variant="bodyMd">{msg.message}</Text>
                        </BlockStack>
                      </Box>
                    ))}
                  </BlockStack>
                </Box>
              </Box>
            </BlockStack>
          )}
        </Modal.Section>
      </Modal>
    </Page>
  );
}