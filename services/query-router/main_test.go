package main

import "testing"

func TestValidateTable_AllowsKnownTable(t *testing.T) {
	got := validateTable("clients")
	if got != "clients" {
		t.Fatalf("expected clients, got %s", got)
	}
}

func TestValidateTable_RejectsUnknownTable(t *testing.T) {
	defer func() {
		if r := recover(); r == nil {
			t.Fatal("expected panic for unknown table")
		}
	}()
	validateTable("not_allowed")
}

func TestValidateOrderBy_AllowsSafeClause(t *testing.T) {
	got := mustValidateOrderBy("clients", "created_at DESC")
	if got != "created_at DESC" {
		t.Fatalf("unexpected order by: %s", got)
	}
}

func TestValidateOrderBy_RejectsInjectedClause(t *testing.T) {
	defer func() {
		if r := recover(); r == nil {
			t.Fatal("expected panic for injected order by")
		}
	}()
	mustValidateOrderBy("clients", "created_at; DROP TABLE clients")
}

func TestValidateJoinCondition_AllowsKnownJoin(t *testing.T) {
	got := mustValidateJoinCondition("clients", "payments", "clients.id = payments.client_id")
	if got != "clients.id = payments.client_id" {
		t.Fatalf("unexpected join clause: %s", got)
	}
}

func TestValidateJoinCondition_RejectsUnknownColumn(t *testing.T) {
	defer func() {
		if r := recover(); r == nil {
			t.Fatal("expected panic for unknown join column")
		}
	}()
	mustValidateJoinCondition("clients", "payments", "clients.bad_column = payments.client_id")
}
