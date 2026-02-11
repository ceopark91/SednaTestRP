CREATE TABLE `commissioning_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`sheetRowId` varchar(255) NOT NULL,
	`model` varchar(255),
	`serialNumber` varchar(255),
	`kw` varchar(255),
	`hz` varchar(255),
	`ampere` varchar(255),
	`commissioningDate` timestamp,
	`status` enum('incomplete','complete') NOT NULL DEFAULT 'incomplete',
	`lastUpdatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commissioning_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `commissioning_records_sheetRowId_unique` UNIQUE(`sheetRowId`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`industry` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `companies_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `sync_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recordId` int NOT NULL,
	`action` enum('read','write','update') NOT NULL,
	`status` enum('success','failed') NOT NULL,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sync_logs_id` PRIMARY KEY(`id`)
);
